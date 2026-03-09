require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const db = require('./db');
const { globalLimiter } = require('./middleware/rateLimiter');

// Uvoz svih vaših ruta
const authRouter = require('./routes/auth');
const korisniciRouter = require('./routes/korisnici');
const kurseviRouter = require('./routes/kursevi');
const lekcijeRouter = require('./routes/lekcije');
const wishlistRouter = require('./routes/wishlist');
const kupovinaRouter = require('./routes/kupovina');
const ratingsRouter = require('./routes/ratings');
const komentariRouter = require('./routes/komentari');
const kompletirane_lekcijeRouter = require('./routes/kompletirane_lekcije');
const popustiRouter = require('./routes/popusti');
const rezultatiKvizaRouter = require('./routes/rezultati_kviza');
const sekcijeRouter = require('./routes/sekcije');
// Paddle removed - using MSU/Chipcard payments
const adminRouter = require('./routes/admin');
const msuPaymentRouter = require('./routes/msuPayment');
const subscriptionStatusRouter = require('./routes/subscriptionStatus');
const subscriptionRenewalRouter = require('./routes/subscriptionRenewal');

const app = express();
const port = process.env.PORT || 5000;

// === Middleware ===

// VAŽNO: Pošto backend radi iza Nginx reverse proxy-ja,
// ovo osigurava da se koristi prava IP adresa korisnika za rate limiting
app.set('trust proxy', 1);

// 1. CORS se primenjuje na sve zahteve, pa ide prvi
const allowedOrigins = [
    'https://test-api.zecevicdev.com',
    'https://localhost:5000',
    'http://localhost:3000'
];
app.use(cors({ origin: allowedOrigins }));

// 2. Globalni rate limiter - 100 req/min po IP
app.use(globalLimiter);

// 3. Helmet - HTTP security headers (XSS, clickjacking, HSTS, itd.)
// contentSecurityPolicy je isključen jer može da blokira CDN-ove i fontove
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// 4. Compression - gzip kompresija svih odgovora (~70% manja veličina)
app.use(compression());

// 3. ZATIM: JSON parser za sve ostale rute
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Sve ostale API rute
app.use('/api/auth', authRouter);
app.use('/api/korisnici', korisniciRouter);
app.use('/api/kursevi', kurseviRouter);
app.use('/api/lekcije', lekcijeRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/kupovina', kupovinaRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/komentari', komentariRouter);
app.use('/api/kompletirane_lekcije', kompletirane_lekcijeRouter);
app.use('/api/popusti', popustiRouter);
app.use('/api/rezultati_kviza', rezultatiKvizaRouter);
app.use('/api/sekcije', sekcijeRouter);
// Paddle route removed - using MSU/Chipcard payments via /api/msu
app.use('/api/admin', adminRouter);
app.use('/api/msu', msuPaymentRouter);
app.use('/api/subscription', subscriptionStatusRouter);
app.use('/api/subscription', subscriptionRenewalRouter);

// === Global Error Handler (Express middleware) ===
app.use((err, req, res, next) => {
    console.error('⚠️ Unhandled Express error:', err.stack);
    res.status(500).json({ error: 'Interna greška servera' });
});

// === Cron Jobs ===
const { startSubscriptionCleanupJob } = require('./jobs/subscriptionCleanup');
const { startAutoRenewalJob } = require('./jobs/autoRenewalCron');

// Start server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);

    // Pokreni subscription cleanup job
    startSubscriptionCleanupJob();

    // Pokreni auto renewal job
    startAutoRenewalJob();
});
server.timeout = 30000; // 30 sekundi (bilo 30 minuta - opasno za server pod opterećenjem)

// === Global Process Error Handlers ===
// Sprečavaju da server tiho padne na neuhvaćenim greškama
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // Ne radimo process.exit() jer to bi ugasilo server - samo logujemo
});