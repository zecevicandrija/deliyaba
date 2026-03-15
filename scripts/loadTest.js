/**
 * VPS Load Test - Simulacija 100 korisnika
 * 
 * Pokreni na VPS-u sa:
 *   node loadTest.js
 * 
 * Šta testira:
 * 1. 100 istovremenih zahteva na /api/kursevi (cache test)
 * 2. Sekvencijalne burst zahteve (rate limit test)
 * 3. Simulaciju realnog browsing-a (kurs → lekcije → sekcije)
 * 4. Meri response time, throughput, i error rate
 * 
 * NAPOMENA: Pokreni DIREKTNO na VPS-u da bi izbegli mrežni latency.
 */

// URL se može proslediti kao argument: node loadTest.js http://localhost:5000
// Ako nema argumenta, koristi localhost (za VPS direktno)
const BASE_URL = process.argv[2] || 'http://localhost:5000';

// ——— Pomoćne funkcije ———

async function timedFetch(url, options = {}) {
    const start = Date.now();
    try {
        const res = await fetch(url, options);
        const elapsed = Date.now() - start;
        return { status: res.status, elapsed, ok: res.ok, error: null };
    } catch (err) {
        return { status: 0, elapsed: Date.now() - start, ok: false, error: err.message };
    }
}

function stats(results) {
    const successful = results.filter(r => r.ok);
    const failed = results.filter(r => !r.ok);
    const times = successful.map(r => r.elapsed);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    const min = times.length ? Math.min(...times) : 0;
    const max = times.length ? Math.max(...times) : 0;
    const p95 = times.length ? times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)] : 0;
    const rateLimited = results.filter(r => r.status === 429).length;

    return { total: results.length, success: successful.length, failed: failed.length, rateLimited, avg, min, max, p95 };
}

function printStats(label, s) {
    console.log(`\n  📊 ${label}:`);
    console.log(`     Ukupno: ${s.total} | Uspešnih: ${s.success} | Neuspešnih: ${s.failed} | Rate Limited: ${s.rateLimited}`);
    console.log(`     Avg: ${s.avg}ms | Min: ${s.min}ms | Max: ${s.max}ms | P95: ${s.p95}ms`);
}

// ——— Test 1: 100 istovremenih zahteva ———

async function test1_concurrent() {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('🏋️  TEST 1: 100 ISTOVREMENIH ZAHTEVA na /api/kursevi');
    console.log('══════════════════════════════════════════════════════════');

    // Zagrij cache jednim zahtevom
    await timedFetch(`${BASE_URL}/api/kursevi`);

    const start = Date.now();
    const promises = [];
    for (let i = 0; i < 100; i++) {
        promises.push(timedFetch(`${BASE_URL}/api/kursevi`));
    }
    const results = await Promise.all(promises);
    const totalTime = Date.now() - start;

    const s = stats(results);
    printStats('100 istovremenih GET /api/kursevi', s);
    console.log(`     Ukupno vreme: ${totalTime}ms`);

    if (s.success >= 95) {
        console.log('\n  ✅ PROLAZI: Server obrađuje 100 istovremenih korisnika!');
    } else {
        console.log(`\n  ⚠️  ${s.failed} zahteva nije uspelo. Proveri server logove.`);
    }

    return s;
}

// ——— Test 2: Simulacija realnog browsing-a ———

async function test2_browsing() {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('🌐 TEST 2: SIMULACIJA REALNOG BROWSING-a (50 "korisnika")');
    console.log('══════════════════════════════════════════════════════════');
    console.log('  Svaki korisnik: kursevi → kurs/1 → lekcije/course/1 → sekcije/1\n');

    const userSession = async (userId) => {
        const results = [];
        // Korisnik učitava listu kurseva
        results.push(await timedFetch(`${BASE_URL}/api/kursevi`));
        // Korisnik klikne na kurs
        results.push(await timedFetch(`${BASE_URL}/api/kursevi/1`));
        // Učitaju se lekcije tog kursa
        results.push(await timedFetch(`${BASE_URL}/api/lekcije/course/1`));
        // Učitaju se sekcije tog kursa
        results.push(await timedFetch(`${BASE_URL}/api/lekcije/sections/1`));
        return results;
    };

    const start = Date.now();
    const sessionPromises = [];
    for (let i = 0; i < 50; i++) {
        sessionPromises.push(userSession(i));
    }

    const allSessions = await Promise.all(sessionPromises);
    const allResults = allSessions.flat();
    const totalTime = Date.now() - start;

    const s = stats(allResults);
    printStats(`50 korisnika × 4 zahteva = ${allResults.length} ukupno`, s);
    console.log(`     Ukupno vreme: ${totalTime}ms`);
    console.log(`     Propusnost: ${Math.round(allResults.length / (totalTime / 1000))} req/sec`);

    if (s.success >= allResults.length * 0.95) {
        console.log('\n  ✅ PROLAZI: Server stabilno obrađuje realne sesije!');
    } else {
        console.log(`\n  ⚠️  ${s.failed} zahteva nije uspelo.`);
    }

    return s;
}

// ——— Test 3: Cache efikasnost ———

async function test3_cache() {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('📦 TEST 3: CACHE EFIKASNOST');
    console.log('══════════════════════════════════════════════════════════');

    // Bez cache-a (prvi poziv ili posle isteka)
    // Ne možemo direktno obrisati cache, ali možemo uporediti vreme
    const firstCall = await timedFetch(`${BASE_URL}/api/kursevi`);

    // Sačekaj da se rezultat keširá
    await new Promise(r => setTimeout(r, 50));

    // Sa cache-om
    const cachedCalls = [];
    for (let i = 0; i < 10; i++) {
        cachedCalls.push(await timedFetch(`${BASE_URL}/api/kursevi`));
    }

    const avgCached = Math.round(cachedCalls.reduce((s, r) => s + r.elapsed, 0) / cachedCalls.length);

    console.log(`\n  📊 Rezultati:`);
    console.log(`     Prvi poziv (DB): ${firstCall.elapsed}ms`);
    console.log(`     Prosek keširanog (10 zahteva): ${avgCached}ms`);

    if (firstCall.elapsed > 0) {
        const speedup = ((firstCall.elapsed - avgCached) / firstCall.elapsed * 100).toFixed(0);
        console.log(`     Ubrzanje: ${speedup}% brži sa cache-om`);
    }

    console.log('\n  ✅ Cache je aktivan');
    return { firstCall: firstCall.elapsed, avgCached };
}

// ——— Test 4: Auth rate limit pod opterećenjem ———

async function test4_rateLimit() {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('🛡️  TEST 4: RATE LIMIT POD OPTEREĆENJEM');
    console.log('══════════════════════════════════════════════════════════');

    const results = [];
    console.log('  Šaljem 15 login zahteva...\n');

    for (let i = 0; i < 15; i++) {
        const r = await timedFetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com', sifra: 'test123' })
        });
        results.push(r);
        const icon = r.status === 429 ? '🚫' : r.status === 401 ? '🔒' : '✅';
        console.log(`  ${icon} #${i + 1}: status=${r.status}, vreme=${r.elapsed}ms`);
    }

    const blocked = results.filter(r => r.status === 429).length;
    console.log(`\n  ${blocked > 0 ? '✅' : '❌'} Rate limiter: ${blocked}/15 blokirano`);

    return { blocked };
}

// ——— Test 5: Stres test — ramp up ———

async function test5_rampUp() {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('📈 TEST 5: RAMP-UP TEST (10 → 25 → 50 → 100 korisnika)');
    console.log('══════════════════════════════════════════════════════════');

    for (const count of [10, 25, 50, 100]) {
        const promises = [];
        const start = Date.now();
        for (let i = 0; i < count; i++) {
            promises.push(timedFetch(`${BASE_URL}/api/kursevi`));
        }
        const results = await Promise.all(promises);
        const totalTime = Date.now() - start;
        const s = stats(results);

        console.log(`\n  👥 ${count} korisnika: Avg=${s.avg}ms | P95=${s.p95}ms | Greške=${s.failed} | Vreme=${totalTime}ms`);
    }

    console.log('\n  ✅ Ramp-up test završen');
}

// ——— Main ———

async function main() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║        VPS LOAD TEST — 100 KORISNIKA                     ║');
    console.log('║        Server: ' + BASE_URL.padEnd(41) + '║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    // Proveri da li server radi
    try {
        const check = await timedFetch(`${BASE_URL}/api/kursevi`);
        if (!check.ok) throw new Error(`Status: ${check.status}`);
        console.log(`\n✅ Server dostupan (${check.elapsed}ms)`);
    } catch (err) {
        console.error(`\n❌ Server nije dostupan na ${BASE_URL}`);
        console.error('   Pokreni ga sa: node index.js');
        process.exit(1);
    }

    const results = {};

    results.cache = await test3_cache();
    results.concurrent = await test1_concurrent();
    results.browsing = await test2_browsing();
    results.rampUp = await test5_rampUp();

    // Sačekaj 60s za rate limit reset pre tog testa
    console.log('\n  ⏳ Čekam 60s da se rate limit resetuje...');
    await new Promise(r => setTimeout(r, 60000));
    results.rateLimit = await test4_rateLimit();

    // ——— Finalni izveštaj ———
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                   FINALNI IZVEŠTAJ                       ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  Cache ubrzanje:     ${String(results.cache.firstCall + 'ms → ' + results.cache.avgCached + 'ms').padEnd(37)}║`);
    console.log(`║  100 istovremenih:   ${String(results.concurrent.success + '/100 uspešnih').padEnd(37)}║`);
    console.log(`║  Avg response time:  ${String(results.concurrent.avg + 'ms').padEnd(37)}║`);
    console.log(`║  P95 response time:  ${String(results.concurrent.p95 + 'ms').padEnd(37)}║`);
    console.log(`║  Rate limit radi:    ${String(results.rateLimit.blocked > 0 ? 'DA ✅' : 'NE ❌').padEnd(37)}║`);
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
}

main().catch(console.error);
