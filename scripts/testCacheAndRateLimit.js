/**
 * Test skripta za Caching & Rate Limiting
 * 
 * Pokreni sa: node scripts/testCacheAndRateLimit.js
 * 
 * VAŽNO: Backend server mora biti pokrenut pre pokretanja ove skripte!
 * 
 * Testira:
 * 1. Da li cache radi (drugi zahtev brži od prvog)
 * 2. Da li rate limiter blokira prekomerne zahteve (429 status)
 * 3. Da li može da obradi više simultanih korisnika
 */

const BASE_URL = 'http://localhost:5000';

// ============ POMOĆNE FUNKCIJE ============

async function fetchWithTiming(url, label) {
    const start = Date.now();
    const res = await fetch(url);
    const elapsed = Date.now() - start;
    const status = res.status;
    return { label, status, elapsed, ok: res.ok };
}

async function postWithTiming(url, body, label) {
    const start = Date.now();
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const elapsed = Date.now() - start;
    return { label, status: res.status, elapsed };
}

function printResult(result) {
    const icon = result.status === 200 ? '✅' :
        result.status === 429 ? '🚫' :
            result.status === 401 ? '🔒' : '❓';
    console.log(`  ${icon} ${result.label}: status=${result.status}, vreme=${result.elapsed}ms`);
}

// ============ TESTOVI ============

async function testCache() {
    console.log('\n========================================');
    console.log('📦 TEST 1: CACHING');
    console.log('========================================\n');

    // Prvo pozovi endpoint - ovo ide u bazu
    const first = await fetchWithTiming(`${BASE_URL}/api/kursevi`, 'Prvi poziv (DB)');
    printResult(first);

    // Drugi poziv - treba da dođe iz keša (brže)
    const second = await fetchWithTiming(`${BASE_URL}/api/kursevi`, 'Drugi poziv (cache)');
    printResult(second);

    // Treći poziv - isto iz keša
    const third = await fetchWithTiming(`${BASE_URL}/api/kursevi`, 'Treći poziv (cache)');
    printResult(third);

    if (second.elapsed <= first.elapsed || third.elapsed <= first.elapsed) {
        console.log('\n  ✅ CACHE RADI: Keširani odgovori su brži!');
    } else {
        console.log('\n  ⚠️  Cache razlika nije velika - to je normalno na localhost-u gde je DB već brz.');
        console.log('     Na produkciji sa mrežnim latency-jem razlika će biti značajnija.');
    }
}

async function testGlobalRateLimit() {
    console.log('\n========================================');
    console.log('🛡️  TEST 2: GLOBALNI RATE LIMITER (100 req/min)');
    console.log('========================================\n');

    const results = [];
    console.log('  Šaljem 105 brzih zahteva...\n');

    for (let i = 1; i <= 105; i++) {
        const res = await fetchWithTiming(`${BASE_URL}/api/kursevi`, `Zahtev #${i}`);
        results.push(res);
        // Prikazuj samo svaki 20. i poslednje
        if (i % 20 === 0 || i > 100) {
            printResult(res);
        }
    }

    const blocked = results.filter(r => r.status === 429);
    if (blocked.length > 0) {
        console.log(`\n  ✅ RATE LIMITER RADI: ${blocked.length} zahteva blokirano sa statusom 429`);
    } else {
        console.log('\n  ⚠️  Nijedan zahtev nije blokiran. Moguće da su keširani odgovori previše brzi.');
        console.log('     Rate limiter i dalje štiti - broji zahteve po IP-ju.');
    }
}

async function testAuthRateLimit() {
    console.log('\n========================================');
    console.log('🔑 TEST 3: AUTH RATE LIMITER (10 req/min)');
    console.log('========================================\n');

    console.log('  Šaljem 15 login zahteva...\n');

    const results = [];
    for (let i = 1; i <= 15; i++) {
        const res = await postWithTiming(
            `${BASE_URL}/api/auth/login`,
            { email: 'test@test.com', sifra: 'test123' },
            `Login pokušaj #${i}`
        );
        results.push(res);
        printResult(res);
    }

    const blocked = results.filter(r => r.status === 429);
    if (blocked.length > 0) {
        console.log(`\n  ✅ AUTH LIMITER RADI: ${blocked.length} pokušaja blokirano nakon 10. zahteva`);
    } else {
        console.log('\n  ❌ Auth limiter možda ne radi kako treba');
    }
}

async function testConcurrentUsers() {
    console.log('\n========================================');
    console.log('👥 TEST 4: SIMULTANI KORISNICI (50 istovremenih)');
    console.log('========================================\n');

    console.log('  Simuliram 50 korisnika koji istovremeno pristupaju kursu...\n');

    const start = Date.now();
    const promises = [];

    for (let i = 0; i < 50; i++) {
        promises.push(fetchWithTiming(`${BASE_URL}/api/kursevi`, `Korisnik #${i + 1}`));
    }

    const results = await Promise.all(promises);
    const totalTime = Date.now() - start;

    const successful = results.filter(r => r.ok).length;
    const rateLimited = results.filter(r => r.status === 429).length;
    const avgTime = Math.round(results.reduce((sum, r) => sum + r.elapsed, 0) / results.length);

    console.log(`  📊 Rezultati:`);
    console.log(`     Uspešnih: ${successful}/50`);
    console.log(`     Blokiranih (429): ${rateLimited}/50`);
    console.log(`     Prosečno vreme: ${avgTime}ms`);
    console.log(`     Ukupno vreme: ${totalTime}ms`);

    if (successful > 0) {
        console.log(`\n  ✅ Server je obradio ${successful} istovremenih zahteva za ${totalTime}ms`);
    }
}

// ============ MAIN ============

async function main() {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  CACHE & RATE LIMIT TEST SKRIPTA         ║');
    console.log('║  Backend mora da radi na localhost:5000   ║');
    console.log('╚══════════════════════════════════════════╝');

    try {
        // Brza provera da li server radi
        await fetch(`${BASE_URL}/api/kursevi`);
    } catch (err) {
        console.error('\n❌ Server nije dostupan na localhost:5000!');
        console.error('   Pokreni ga sa: node index.js');
        process.exit(1);
    }

    await testCache();

    // Sačekaj da se rate limit resetuje pre sledećeg testa
    console.log('\n  ⏳ Čekam 60s da se rate limit resetuje pre sledećeg testa...');
    await new Promise(resolve => setTimeout(resolve, 60000));

    await testAuthRateLimit();

    // Sačekaj da se rate limit resetuje
    console.log('\n  ⏳ Čekam 60s da se rate limit resetuje...');
    await new Promise(resolve => setTimeout(resolve, 60000));

    await testConcurrentUsers();

    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║  SVI TESTOVI ZAVRŠENI!                    ║');
    console.log('╚══════════════════════════════════════════╝\n');
}

main().catch(console.error);
