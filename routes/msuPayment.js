/**
 * MSU Payment Routes
 * Handles all MSU payment-related endpoints with guest checkout support
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const msuService = require('../utils/msuService');
const generateRandomPassword = require('../utils/passwordGenerator');
const { sendMsuWelcomeEmail, sendInvoiceEmail } = require('../utils/msuEmailHelper');
const { createInvoice } = require('../utils/invoiceService');
const { createSessionLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { createMsuSessionSchema } = require('../validators/ostaleSchemas');

/**
 * POST /api/msu/create-session
 * Creates a new MSU payment session - supports both logged-in and guest users
 */
router.post('/create-session', createSessionLimiter, validate(createMsuSessionSchema), async (req, res) => {
    try {
        const { korisnikId, kursId: reqKursId, customerEmail, customerName, customerPhone, packageData } = req.body;

        let orderItems = [];
        let totalAmount = 0;
        let itemId = null;
        let itemType = 'course';
        let kursId = reqKursId; // Use let so it can be reassigned for packages

        // Ako je prosleđen kursId, dohvati iz baze
        if (kursId) {
            const [kursevi] = await db.query(
                'SELECT id, naziv, cena, opis FROM kursevi WHERE id = ?',
                [kursId]
            );

            if (kursevi.length === 0) {
                return res.status(404).json({ error: 'Kurs nije pronađen' });
            }

            const kurs = kursevi[0];
            itemId = kurs.id;
            totalAmount = parseFloat(kurs.cena);

            orderItems = [{
                code: kurs.id.toString(),
                name: kurs.naziv,
                description: kurs.opis || kurs.naziv,
                quantity: 1,
                amount: totalAmount
            }];
        }
        // Ako je prosleđen packageData
        else if (packageData) {
            itemId = packageData.id || 'PACKAGE_' + Date.now();
            itemType = 'package';
            totalAmount = parseFloat(packageData.amount);

            // Paketi uvek daju pristup kursu ID=1
            kursId = 1;

            orderItems = [{
                code: packageData.code || itemId,
                name: packageData.name,
                description: packageData.description || packageData.name,
                quantity: 1,
                amount: totalAmount
            }];
        } else {
            return res.status(400).json({
                error: 'Either kursId or packageData is required'
            });
        }

        // Generiši kraći jedinstveni merchantPaymentId (max 20 karaktera za Intesa/Raiffeisen)
        // Format: ORD-{timestamp poslednjih 9 cifara}-{random 3 karaktera}
        // Primer: ORD-173792012-ABC
        const timestamp = Date.now().toString().slice(-9);
        const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
        const merchantPaymentId = `ORD-${timestamp}-${randomChars}`;

        // Kreiranje CIT MSU session tokena (za recurring payments)
        const sessionData = {
            customerId: (korisnikId || customerEmail).toString(),
            customerEmail,
            customerName,
            customerPhone: customerPhone || '',
            merchantPaymentId,
            amount: totalAmount,
            orderItems,
            returnUrl: 'http://localhost:5000/api/msu/callback-redirect'
        };

        // Koristi CIT session za automatic recurring payments
        const msuResponse = await msuService.createCITSession(sessionData);

        if (msuResponse.responseCode !== '00') {
            console.error('MSU session creation failed:', msuResponse);
            return res.status(500).json({
                error: 'Kreiranje sesije plaćanja nije uspelo',
                details: msuResponse.responseMsg || 'Unknown error'
            });
        }

        const sessionToken = msuResponse.sessionToken;

        // Sačuvaj transakciju - korisnik_id može biti NULL za guest
        let finalKorisnikId = korisnikId;
        if (!finalKorisnikId) {
            const [existingUsers] = await db.query(
                'SELECT id FROM korisnici WHERE email = ? LIMIT 1',
                [customerEmail]
            );

            if (existingUsers.length > 0) {
                finalKorisnikId = existingUsers[0].id;
                console.log(`Found existing user with email ${customerEmail}, using ID=${finalKorisnikId}`);
            }
        }

        await db.query(
            `INSERT INTO msu_transakcije 
            (korisnik_id, kurs_id, merchant_payment_id, session_token, amount, currency, status, response_code, response_msg, raw_response) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                finalKorisnikId || null,
                kursId,
                merchantPaymentId,
                sessionToken,
                totalAmount,
                'RSD',
                'PENDING',
                msuResponse.responseCode,
                msuResponse.responseMsg,
                JSON.stringify({ customerEmail, customerName, itemType, packageData })
            ]
        );

        const redirectUrl = msuService.buildHppUrl(sessionToken);

        res.status(200).json({
            success: true,
            redirectUrl,
            merchantPaymentId,
            sessionToken
        });

    } catch (error) {
        console.error('Error creating MSU session:', error);
        res.status(500).json({
            error: 'Greška pri kreiranju sesije plaćanja'
        });
    }
});
/**
 * Helper: Odredi koliko meseci pretplata traje na osnovu packageData
 */
function getSubscriptionMonths(packageData) {
    if (!packageData?.id) return 1;
    if (packageData.id.includes('3M')) return 3;
    return 1; // Default 1 mesec (uključuje 1M i sve ostalo)
}

/**
 * Helper: Parsuj traceID iz bankResponseExtras (može biti URL-encoded string ili objekat)
 */
function parseTraceID(bankResponseExtras) {
    if (!bankResponseExtras) return null;

    let bankExtras;
    if (typeof bankResponseExtras === 'string') {
        try {
            const decoded = decodeURIComponent(bankResponseExtras);
            bankExtras = JSON.parse(decoded);
        } catch (err) {
            console.warn('Failed to parse bankResponseExtras:', err);
            return null;
        }
    } else {
        bankExtras = bankResponseExtras;
    }

    return bankExtras.TRACEID || null;
}

/**
 * GET + POST /api/msu/callback-redirect
 * Receives callback from MSU (supports both GET and POST), processes payment, and redirects to frontend
 * 
 * ⚠️ TRANSACTION SAFETY: Sve kritične DB operacije (status update, kreiranje korisnika,
 * aktivacija pretplate, kupovina, recurring) su obmotane u jednu MySQL transakciju.
 * Ako bilo koja operacija fajluje → ROLLBACK svih promena → sprečava "ghost" naplate.
 * Email i fiskalizacija ostaju VAN transakcije jer su spoljni servisi.
 */
router.all('/callback-redirect', async (req, res) => {
    try {
        // Support both GET (query params) and POST (body) from 3D Secure
        const responseData = { ...req.query, ...req.body };

        console.log('\n========================================');
        console.log('=== MSU CALLBACK REDIRECT RECEIVED ===');
        console.log('========================================');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Method:', req.method);
        console.log('\n--- Request Headers ---');
        console.log(JSON.stringify(req.headers, null, 2));
        console.log('\n--- Query Params ---');
        console.log(JSON.stringify(req.query, null, 2));
        console.log('\n--- Body ---');
        console.log(JSON.stringify(req.body, null, 2));
        console.log('\n--- Merged Response Data ---');
        console.log(JSON.stringify(responseData, null, 2));
        console.log('========================================\n');

        const merchantPaymentId = responseData.merchantPaymentId;
        const responseCode = responseData.responseCode;
        const responseMsg = responseData.responseMsg;

        if (!merchantPaymentId) {
            console.error('❌ Missing merchantPaymentId in callback');
            console.error('Available keys:', Object.keys(responseData));

            // Pokušaj pronaći transakciju po drugim parametrima
            let transaction = null;

            if (responseData.pgTranId) {
                console.log('Attempting to find by pgTranId:', responseData.pgTranId);
                const [txns] = await db.query(
                    'SELECT * FROM msu_transakcije WHERE pg_tran_id = ?',
                    [responseData.pgTranId]
                );
                if (txns.length > 0) transaction = txns[0];
            }

            if (!transaction && responseData.sessionToken) {
                console.log('Attempting to find by sessionToken:', responseData.sessionToken);
                const [txns] = await db.query(
                    'SELECT * FROM msu_transakcije WHERE session_token = ?',
                    [responseData.sessionToken]
                );
                if (txns.length > 0) transaction = txns[0];
            }

            if (!transaction) {
                return res.redirect(`https://localhost:3000/placanje/rezultat?error=missing_payment_id`);
            }

            console.log('✅ Found transaction via fallback method:', transaction.merchant_payment_id);
            // Continue processing with found transaction
        }

        // Pronađi transakciju u bazi (read-only, pre transakcije)
        const [transactions] = await db.query(
            'SELECT * FROM msu_transakcije WHERE merchant_payment_id = ?',
            [merchantPaymentId]
        );

        if (transactions.length === 0) {
            console.error('❌ Transaction not found:', merchantPaymentId);
            console.error('Attempting to query database for similar transactions...');

            const [recentTxns] = await db.query(
                `SELECT * FROM msu_transakcije 
                WHERE status = 'PENDING' 
                AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
                ORDER BY created_at DESC 
                LIMIT 5`
            );

            console.log(`Found ${recentTxns.length} recent pending transactions:`);
            recentTxns.forEach(tx => {
                console.log(`  - ${tx.merchant_payment_id} (created: ${tx.created_at})`);
            });

            return res.redirect(`https://localhost:3000/placanje/rezultat?error=transaction_not_found&id=${encodeURIComponent(merchantPaymentId)}`);
        }

        const transaction = transactions[0];
        console.log('✅ Transaction found in database:', {
            id: transaction.id,
            merchantPaymentId: transaction.merchant_payment_id,
            status: transaction.status,
            korisnikId: transaction.korisnik_id
        });

        // ✅ IDEMPOTENCY GUARD: Ako je transakcija već obrađena, preskoči sve
        if (transaction.status === 'APPROVED') {
            console.log('⚠️ Transaction already APPROVED, skipping duplicate processing. merchantPaymentId:', merchantPaymentId);
            return res.redirect(`https://localhost:3000/profil?payment=success`);
        }

        const status = responseCode === '00' ? 'APPROVED' : 'FAILED';

        // ⚠️ VAŽNO: Merge existing raw_response with new responseData
        let existingRawData = {};
        if (transaction.raw_response) {
            if (typeof transaction.raw_response === 'string') {
                try {
                    existingRawData = JSON.parse(transaction.raw_response);
                } catch (err) {
                    console.warn('Failed to parse existing raw_response:', err);
                }
            } else {
                existingRawData = transaction.raw_response;
            }
        }

        // ⚠️ KRITIČNO: Merge OBRNUTO - callback podaci prvo, pa originals preko njih!
        const mergedRawData = {
            ...responseData,
            customerEmail: existingRawData.customerEmail || responseData.customerEmail,
            customerName: existingRawData.customerName || responseData.customerName,
            itemType: existingRawData.itemType,
            packageData: existingRawData.packageData
        };

        console.log('📦 Merged raw_response will contain:', {
            hasCustomerEmail: !!mergedRawData.customerEmail,
            customerEmail: mergedRawData.customerEmail,
            hasCustomerName: !!mergedRawData.customerName,
            customerName: mergedRawData.customerName,
            hasCardToken: !!mergedRawData.cardToken,
            hasBankResponseExtras: !!mergedRawData.bankResponseExtras
        });

        // ═══════════════════════════════════════════════════════════════
        // PRE-TRANSACTION: Pripremi CPU-intensive operacije van transakcije
        // da se smanji vreme zaključavanja konekcije
        // ═══════════════════════════════════════════════════════════════
        let guestPassword = null;
        let guestHashedPassword = null;
        const customerEmail = mergedRawData.customerEmail;
        const customerName = mergedRawData.customerName || 'Korisnik';

        if (status === 'APPROVED' && !transaction.korisnik_id && customerEmail) {
            // Pre-hash password za potencijalno kreiranje guest korisnika (bcrypt je CPU-heavy)
            guestPassword = generateRandomPassword();
            guestHashedPassword = await bcrypt.hash(guestPassword, 10);
        }

        // ═══════════════════════════════════════════════════════════════
        // START TRANSACTION: Sve kritične DB operacije unutar jedne transakcije
        // ═══════════════════════════════════════════════════════════════
        const connection = await db.getConnection();
        let userId = transaction.korisnik_id;
        let isNewUser = false;

        try {
            await connection.beginTransaction();
            console.log('🔒 Transaction started for merchantPaymentId:', merchantPaymentId);

            // KORAK 1: Ažuriraj status transakcije
            await connection.query(
                `UPDATE msu_transakcije 
                SET pg_tran_id = ?, pg_order_id = ?, pg_tran_appr_code = ?, 
                    status = ?, response_code = ?, response_msg = ?, 
                    raw_response = ?, updated_at = NOW()
                WHERE merchant_payment_id = ?`,
                [
                    responseData.pgTranId || null,
                    responseData.pgOrderId || null,
                    responseData.pgTranApprCode || null,
                    status,
                    responseCode,
                    responseMsg,
                    JSON.stringify(mergedRawData),
                    merchantPaymentId
                ]
            );

            if (status === 'APPROVED') {
                const subscriptionMonths = getSubscriptionMonths(mergedRawData.packageData);
                const now = new Date();
                const expiryDate = new Date(now);
                expiryDate.setMonth(expiryDate.getMonth() + subscriptionMonths);

                // KORAK 2: Guest user — pronađi ili kreiraj korisnika
                if (!userId && customerEmail) {
                    const [existing] = await connection.query(
                        'SELECT id FROM korisnici WHERE email = ?',
                        [customerEmail]
                    );

                    if (existing.length > 0) {
                        userId = existing[0].id;
                        console.log(`✅ Existing user found: ID=${userId}`);
                    } else {
                        // Kreiraj novog korisnika (password je već hash-ovan pre transakcije)
                        const [ime, ...prezimeParts] = customerName.split(/\s+/);
                        const prezime = prezimeParts.join(' ') || ime;

                        const [insertRes] = await connection.query(
                            `INSERT INTO korisnici (ime, prezime, email, sifra, uloga, subscription_expires_at, subscription_status) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [ime, prezime, customerEmail, guestHashedPassword, 'korisnik', expiryDate, 'active']
                        );

                        userId = insertRes.insertId;
                        isNewUser = true;

                        console.log('========================================');
                        console.log('✅ NEW USER CREATED:');
                        console.log(`   ID: ${userId}`);
                        console.log(`   Email: ${customerEmail}`);
                        console.log(`   Subscription Expires: ${expiryDate.toISOString()}`);
                        console.log(`   Duration: ${subscriptionMonths} month(s)`);
                        console.log('========================================');
                    }

                    // KORAK 3: Poveži korisnika sa transakcijom
                    await connection.query(
                        'UPDATE msu_transakcije SET korisnik_id = ? WHERE merchant_payment_id = ?',
                        [userId, merchantPaymentId]
                    );
                }

                // KORAK 4: Ažuriraj subscription za SVE korisnike (nove i postojeće)
                if (userId && transaction.kurs_id) {
                    await connection.query(
                        'UPDATE korisnici SET subscription_expires_at = ?, subscription_status = ? WHERE id = ?',
                        [expiryDate, 'active', userId]
                    );

                    console.log('========================================');
                    console.log('✅ SUBSCRIPTION EXTENDED:');
                    console.log(`   User ID: ${userId}`);
                    console.log(`   New Expiry: ${expiryDate.toISOString()}`);
                    console.log(`   Duration: ${subscriptionMonths} month(s)`);
                    console.log('========================================');
                }

                // KORAK 5: Zapiši kupovinu
                if (userId && transaction.kurs_id) {
                    try {
                        await connection.query(
                            'INSERT INTO kupovina (korisnik_id, kurs_id, popust_id) VALUES (?, ?, ?)',
                            [userId, transaction.kurs_id, null]
                        );
                        console.log(`✅ Course added to purchases: user_id=${userId}, kurs_id=${transaction.kurs_id}`);
                    } catch (purchaseErr) {
                        if (purchaseErr.code !== 'ER_DUP_ENTRY') {
                            throw purchaseErr; // Ponovo baci grešku da triggeruje ROLLBACK
                        }
                        // ER_DUP_ENTRY je OK — korisnik je već kupio kurs (idempotentna operacija)
                        console.log(`ℹ️ Purchase already exists for user_id=${userId}, kurs_id=${transaction.kurs_id}`);
                    }
                }

                // KORAK 6: Kreiraj recurring subscription (ako postoji cardToken i traceID)
                if (userId && responseData.cardToken) {
                    const traceID = parseTraceID(responseData.bankResponseExtras);
                    console.log(`🔍 Recurring check — traceID: ${traceID || 'NOT FOUND'}, cardToken: EXISTS`);

                    if (traceID) {
                        const nextBillingDate = new Date(now);
                        nextBillingDate.setMonth(nextBillingDate.getMonth() + subscriptionMonths);

                        const [existingRecurring] = await connection.query(
                            'SELECT id FROM recurring_subscriptions WHERE korisnik_id = ? AND is_active = 1',
                            [userId]
                        );

                        if (existingRecurring.length === 0) {
                            await connection.query(
                                `INSERT INTO recurring_subscriptions 
                                (korisnik_id, kurs_id, card_token, trace_id, msu_customer_id, amount, currency, 
                                frequency, occurrence, subscription_months, is_active, next_billing_date, last_billing_date) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                                [
                                    userId,
                                    transaction.kurs_id,
                                    responseData.cardToken,
                                    traceID,
                                    responseData.customerId || userId.toString(),
                                    transaction.amount,
                                    transaction.currency || 'RSD',
                                    1, // frequency
                                    'MONTH', // occurrence
                                    subscriptionMonths,
                                    1, // is_active = true
                                    nextBillingDate
                                ]
                            );

                            console.log('========================================');
                            console.log('✅ RECURRING SUBSCRIPTION CREATED:');
                            console.log(`   User ID: ${userId}`);
                            console.log(`   Card Token: ${responseData.cardToken.substring(0, 10)}...`);
                            console.log(`   Trace ID: ${traceID}`);
                            console.log(`   Next Billing: ${nextBillingDate.toISOString()}`);
                            console.log('========================================');
                        } else {
                            console.log(`⚠️ Recurring subscription already exists for user ${userId}`);
                        }
                    } else {
                        console.warn('⚠️ TraceID not found in response - skipping recurring subscription creation');
                    }
                } else if (status === 'APPROVED') {
                    console.warn('⚠️ Skipping recurring subscription creation:');
                    if (!userId) console.warn('   - userId is missing');
                    if (!responseData.cardToken) console.warn('   - cardToken is missing from response');
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // COMMIT: Sve DB operacije su uspele — sačuvaj promene
            // ═══════════════════════════════════════════════════════════════
            await connection.commit();
            console.log('✅ Transaction COMMITTED successfully for merchantPaymentId:', merchantPaymentId);

        } catch (txError) {
            // ═══════════════════════════════════════════════════════════════
            // ROLLBACK: Nešto nije uspelo — vrati sve DB promene
            // ═══════════════════════════════════════════════════════════════
            await connection.rollback();
            console.error('❌ Transaction ROLLED BACK for merchantPaymentId:', merchantPaymentId);
            console.error('   Error:', txError.message);
            console.error('   Stack:', txError.stack);
            return res.redirect(`https://localhost:3000/placanje/rezultat?error=server_error`);
        } finally {
            connection.release();
            console.log('🔓 DB connection released for merchantPaymentId:', merchantPaymentId);
        }

        // ═══════════════════════════════════════════════════════════════
        // POST-TRANSACTION: Fire-and-forget operacije (spoljni servisi)
        // Ove operacije NE MOGU da se rollback-uju, ali transaction je 
        // već COMMIT-ovan tako da su DB podaci sigurni.
        // ═══════════════════════════════════════════════════════════════
        if (status === 'APPROVED') {
            // Welcome email za nove guest korisnike
            if (isNewUser && guestPassword && customerEmail) {
                try {
                    const [ime] = customerName.split(/\s+/);
                    console.log('📧 Attempting to send welcome email...');
                    console.log(`   To: ${customerEmail}`);
                    console.log(`   Name: ${ime}`);
                    console.log(`   Has RESEND_API_KEY: ${!!process.env.RESEND_API_KEY}`);

                    const emailResult = await sendMsuWelcomeEmail(customerEmail, guestPassword, ime);

                    if (emailResult) {
                        console.log(`✅ Welcome email sent successfully to ${customerEmail}`);
                    } else {
                        console.warn(`⚠️ Email function returned false for ${customerEmail}`);
                    }
                } catch (emailErr) {
                    console.error('❌ Failed to send welcome email:');
                    console.error('   Error:', emailErr.message);
                    console.error('   Stack:', emailErr.stack);
                }
            }

            // Fiskalizacija: Kreiraj račun i pošalji mejl
            try {
                let invoiceItemName = 'Motion Akademija - Pretplata';
                let invoiceAmount = parseFloat(transaction.amount);

                if (mergedRawData.packageData && mergedRawData.packageData.name) {
                    invoiceItemName = mergedRawData.packageData.name;
                } else if (transaction.kurs_id) {
                    const [kursData] = await db.query(
                        'SELECT naziv FROM kursevi WHERE id = ?',
                        [transaction.kurs_id]
                    );
                    if (kursData.length > 0) {
                        invoiceItemName = kursData[0].naziv;
                    }
                }

                console.log('📄 Creating fiscal invoice...');
                const invoiceResult = await createInvoice({
                    itemName: invoiceItemName,
                    price: invoiceAmount,
                    quantity: 1,
                    paymentType: 2
                });

                if (invoiceResult && invoiceResult.invoice_pdf) {
                    let invoiceEmail = mergedRawData.customerEmail;
                    let invoiceName = mergedRawData.customerName || 'Korisnik';

                    if (!invoiceEmail && userId) {
                        const [userData] = await db.query(
                            'SELECT email, ime FROM korisnici WHERE id = ?',
                            [userId]
                        );
                        if (userData.length > 0) {
                            invoiceEmail = userData[0].email;
                            invoiceName = userData[0].ime || invoiceName;
                        }
                    }

                    if (invoiceEmail) {
                        await sendInvoiceEmail(
                            invoiceEmail,
                            invoiceName.split(/\s+/)[0],
                            invoiceResult.invoice_pdf,
                            invoiceAmount
                        );
                        console.log(`✅ Invoice email sent to ${invoiceEmail}`);
                    }
                }
            } catch (invoiceErr) {
                console.error('⚠️ Invoice creation/email failed (non-blocking):', invoiceErr.message);
            }

            return res.redirect(`https://localhost:3000/profil?payment=success`);
        } else {
            return res.redirect(`https://localhost:3000/placanje/rezultat?merchantPaymentId=${merchantPaymentId}&status=failed&message=${encodeURIComponent(responseMsg)}`);
        }

    } catch (error) {
        console.error('Error handling MSU callback redirect:', error);
        return res.redirect(`https://localhost:3000/placanje/rezultat?error=server_error`);
    }
});

/**
 * POST /api/msu/callback
 * MSU Notification Service callback (server-to-server)
 * This is different from callback-redirect which is browser-based
 */
router.post('/callback', async (req, res) => {
    try {
        console.log('\n========================================');
        console.log('=== MSU NOTIFICATION CALLBACK ===');
        console.log('========================================');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('========================================\n');

        const {
            merchantBusinessId,
            status,
            merchantPaymentId,
            amount,
            notificationType,
            transactionType,
            pgTransactionId,
            customer
        } = req.body;

        if (!merchantPaymentId) {
            console.error('❌ Missing merchantPaymentId in notification callback');
            return res.status(400).json({ error: 'merchantPaymentId is required' });
        }

        console.log(`📥 Notification: ${notificationType} for ${merchantPaymentId}`);

        // Pronađi transakciju
        const [transactions] = await db.query(
            'SELECT * FROM msu_transakcije WHERE merchant_payment_id = ?',
            [merchantPaymentId]
        );

        if (transactions.length === 0) {
            console.error(`❌ Transaction not found: ${merchantPaymentId}`);
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const transaction = transactions[0];
        console.log(`✅ Found transaction ID: ${transaction.id}`);

        // Ažuriraj status transakcije
        const msuStatus = status === 'AP' ? 'APPROVED' : 'FAILED';
        await db.query(
            `UPDATE msu_transakcije 
            SET pg_tran_id = ?, status = ?, raw_response = ?, updated_at = NOW()
            WHERE merchant_payment_id = ?`,
            [
                pgTransactionId,
                msuStatus,
                JSON.stringify(req.body),
                merchantPaymentId
            ]
        );

        console.log(`✅ Transaction ${merchantPaymentId} updated to status: ${msuStatus}`);

        // Vrati success response serveru MSU
        return res.status(200).json({ success: true, message: 'Notification received' });

    } catch (error) {
        console.error('❌ Error handling MSU notification callback:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/msu/status/:merchantPaymentId
 * Check the status of a payment transaction
 */
router.get('/status/:merchantPaymentId', async (req, res) => {
    try {
        const { merchantPaymentId } = req.params;

        const [transactions] = await db.query(
            `SELECT t.*, k.naziv as kurs_naziv 
            FROM msu_transakcije t
            LEFT JOIN kursevi k ON t.kurs_id = k.id
            WHERE t.merchant_payment_id = ?`,
            [merchantPaymentId]
        );

        if (transactions.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const transaction = transactions[0];

        res.status(200).json({
            success: true,
            transaction: {
                merchantPaymentId: transaction.merchant_payment_id,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency,
                kursNaziv: transaction.kurs_naziv,
                responseCode: transaction.response_code,
                responseMsg: transaction.response_msg,
                createdAt: transaction.created_at,
                updatedAt: transaction.updated_at
            }
        });

    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
