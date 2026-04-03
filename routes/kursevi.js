const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/token');
const requireAdmin = require('../middleware/requireAdmin');
const { cacheMiddleware, invalidateCache } = require('../middleware/cacheMiddleware');
const { validate } = require('../middleware/validate');
const { createKursSchema, updateKursSchema } = require('../validators/kurseviSchemas');

// GET Svi kursevi (keširano 5 minuta)
router.get('/', cacheMiddleware(300), async (req, res) => {
    try {
        const query = 'SELECT * FROM kursevi';
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Greška na serveru' });
    }
});

// GET Specifičan kurs po ID-ju (keširano 5 minuta)
router.get('/:id', cacheMiddleware(300), async (req, res) => {
    try {
        const courseId = req.params.id;
        const query = 'SELECT * FROM kursevi WHERE id = ?';
        const [results] = await db.query(query, [courseId]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Kurs nije pronađen' });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Greška na serveru' });
    }
});

// GET Kursevi po ID-ju instruktora
router.get('/instruktor/:id', async (req, res) => {
    try {
        const instructorId = req.params.id;
        const query = 'SELECT * FROM kursevi WHERE instruktor_id = ?';
        const [results] = await db.query(query, [instructorId]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Greška na serveru' });
    }
});

// --- POST Novi kurs (slika kao URL string) ---
router.post('/', authMiddleware, requireAdmin, validate(createKursSchema), async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { naziv, opis, instruktor_id, cena, slika, is_subscription, sekcije } = req.body;
        const parsedSekcije = typeof sekcije === 'string' ? JSON.parse(sekcije) : (sekcije || []);

        await connection.beginTransaction();

        const kursQuery = 'INSERT INTO kursevi (naziv, opis, instruktor_id, cena, slika, is_subscription) VALUES (?, ?, ?, ?, ?, ?)';
        const [kursResult] = await connection.query(kursQuery, [naziv, opis, instruktor_id, cena, slika, is_subscription || 0]);
        const noviKursId = kursResult.insertId;

        if (Array.isArray(parsedSekcije) && parsedSekcije.length > 0) {
            const sekcijeQuery = 'INSERT INTO sekcije (kurs_id, naziv, redosled) VALUES ?';
            const sekcijeData = parsedSekcije.map((naziv, index) => [noviKursId, naziv, index + 1]);
            await connection.query(sekcijeQuery, [sekcijeData]);
        }

        await connection.commit();
        invalidateCache('/api/kursevi');
        res.status(201).json({ message: 'Kurs i sekcije su uspešno dodati', courseId: noviKursId });
    } catch (error) {
        await connection.rollback();
        console.error('Greška prilikom dodavanja kursa:', error);
        res.status(500).json({ error: 'Došlo je do greške na serveru.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- PUT Ažuriranje kursa (slika kao URL string) ---
router.put('/:id', authMiddleware, requireAdmin, validate(updateKursSchema), async (req, res) => {
    try {
        const courseId = req.params.id;
        const { naziv, opis, cena, instruktor_id, slika, is_subscription } = req.body;

        const fieldsToUpdate = {};
        if (naziv) fieldsToUpdate.naziv = naziv;
        if (opis) fieldsToUpdate.opis = opis;
        if (cena) fieldsToUpdate.cena = cena;
        if (instruktor_id) fieldsToUpdate.instruktor_id = instruktor_id;
        if (is_subscription !== undefined) fieldsToUpdate.is_subscription = is_subscription;
        if (slika) fieldsToUpdate.slika = slika;

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ error: 'Nema polja za ažuriranje' });
        }

        const query = 'UPDATE kursevi SET ? WHERE id = ?';
        const [results] = await db.query(query, [fieldsToUpdate, courseId]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Kurs nije pronađen' });
        }

        res.status(200).json({ message: 'Kurs uspešno ažuriran' });
        invalidateCache('/api/kursevi');
    } catch (error) {
        console.error('Greška prilikom ažuriranja kursa:', error);
        res.status(500).json({ error: 'Došlo je do greške na serveru.' });
    }
});

// --- DELETE Brisanje kursa ---
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const courseId = req.params.id;
        const query = 'DELETE FROM kursevi WHERE id = ?';
        const [results] = await db.query(query, [courseId]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: `Kurs sa ID-jem ${courseId} nije pronađen` });
        }
        res.status(200).json({ message: `Kurs sa ID-jem ${courseId} uspešno obrisan` });
        invalidateCache('/api/kursevi'); // Obriši keš nakon brisanja
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Greška na serveru' });
    }
});

// **--- GET PROGRES SEKCIJA (ISPRAVLJENA VERZIJA) ---**
router.get('/progres-sekcija/:kursId/korisnik/:korisnikId', async (req, res) => {
    try {
        const { kursId, korisnikId } = req.params;

        // SQL UPIT JE ISPRAVLJEN DA UKLJUČUJE THUMBNAIL
        const query = `
            SELECT
                s.id AS sekcija_id,
                s.naziv AS naziv_sekcije,
                s.redosled,
                s.thumbnail, -- <-- ISPRAVKA 1: Dodato polje
                (SELECT COUNT(*) FROM lekcije l WHERE l.sekcija_id = s.id) AS ukupan_broj_lekcija,
                (SELECT COUNT(kl.id)
                 FROM kompletirane_lekcije kl
                 JOIN lekcije l2 ON kl.lekcija_id = l2.id
                 WHERE l2.sekcija_id = s.id AND kl.korisnik_id = ?) AS kompletiranih_lekcija
            FROM
                sekcije s
            WHERE
                s.kurs_id = ?
            GROUP BY
                s.id, s.naziv, s.redosled, s.thumbnail -- <-- ISPRAVKA 2: Dodato polje
            ORDER BY
                s.redosled ASC;
        `;

        const [sekcije] = await db.query(query, [korisnikId, kursId]);

        // Preračunavanje progresa (ispravljena greška sa ćirilicom)
        const progresPoSekcijama = sekcije.map(sekcija => ({
            ...sekcija,
            progres: sekcija.ukupan_broj_lekcija > 0
                ? Math.round((sekcija.kompletiranih_lekcija / sekcija.ukupan_broj_lekcija) * 100)
                : 0
        }));

        res.status(200).json(progresPoSekcijama);
    } catch (err) {
        console.error('Greška pri dohvatanju progresa po sekcijama:', err);
        res.status(500).json({ error: 'Greška na serveru.' });
    }
});

module.exports = router;