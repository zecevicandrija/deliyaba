/**
 * Invoice Service - NetRačuni API Integration
 * Creates fiscal invoices via NetRačuni API
 */

const axios = require('axios');

const NET_RACUNI_API_URL = 'https://netracuni.com/api';

/**
 * Create an invoice via NetRačuni API
 * @param {Object} params
 * @param {string} params.itemName - Name of the item (e.g., course name or package name)
 * @param {number} params.price - Price per unit in RSD (e.g., 4999.00)
 * @param {number} [params.quantity=1] - Quantity
 * @param {number} [params.paymentType=2] - Payment type (2 = card)
 * @returns {Promise<{invoice: Object, invoice_pdf: string} | null>} Invoice data or null on failure
 */
async function createInvoice({ itemName, price, quantity = 1, paymentType = 2 }) {
    const apiKey = process.env.RACUNI_API_KEY;

    if (!apiKey) {
        console.warn('⚠️ RACUNI_API_KEY nije postavljen - preskačem kreiranje računa.');
        return null;
    }

    try {
        const invoiceRequestData = {
            paymentType,
            items: [
                {
                    name: itemName,
                    taxLabels: ['Ж'], // PDV 19% (srpski standard za elektronske usluge)
                    unit: 'KOM',
                    quantity,
                    price: parseFloat(price.toFixed(2)),
                }
            ]
        };

        console.log('📄 Creating invoice via NetRačuni API...');
        console.log('   Item:', itemName);
        console.log('   Price:', price, 'RSD');
        console.log('   Payment Type:', paymentType);

        const response = await axios.post(
            `${NET_RACUNI_API_URL}/create-invoice`,
            invoiceRequestData,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 seconds timeout
            }
        );

        console.log('✅ Invoice created successfully!');
        console.log('   Invoice PDF:', response.data.invoice_pdf);
        console.log('   Invoice Number:', response.data.invoice?.invoiceNumber || 'N/A');

        return {
            invoice: response.data.invoice,
            invoice_pdf: response.data.invoice_pdf
        };

    } catch (error) {
        console.error('❌ Greška pri kreiranju računa (NetRačuni):');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data?.message || error.response.data);
        } else {
            console.error('   Error:', error.message);
        }
        return null;
    }
}

/**
 * Ping NetRačuni API to verify connectivity
 * @returns {Promise<boolean>}
 */
async function pingNetRacuni() {
    const apiKey = process.env.RACUNI_API_KEY;

    if (!apiKey) {
        console.warn('⚠️ RACUNI_API_KEY nije postavljen.');
        return false;
    }

    try {
        const response = await axios.get(`${NET_RACUNI_API_URL}/ping`, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            timeout: 10000
        });
        console.log('✅ NetRačuni API ping:', response.data);
        return true;
    } catch (error) {
        console.error('❌ NetRačuni API ping failed:', error.response?.data?.message || error.message);
        return false;
    }
}

module.exports = {
    createInvoice,
    pingNetRacuni
};
