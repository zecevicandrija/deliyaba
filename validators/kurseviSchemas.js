/**
 * Kursevi Schemas - Validacione šeme za kursevi rute
 * 
 * Pokriva: /api/kursevi (POST, PUT)
 */

const { z } = require('zod');

// =============================================
// POST /api/kursevi - Kreiranje kursa
// =============================================
const createKursSchema = z.object({
    naziv: z.string()
        .trim()
        .min(1, 'Naziv kursa je obavezan.')
        .max(255, 'Naziv kursa ne sme biti duži od 255 karaktera.'),

    opis: z.string()
        .trim()
        .min(1, 'Opis kursa je obavezan.')
        .max(5000, 'Opis kursa ne sme biti duži od 5000 karaktera.'),

    instruktor_id: z.number({ invalid_type_error: 'instruktor_id mora biti broj.' })
        .int('instruktor_id mora biti ceo broj.')
        .positive('instruktor_id mora biti pozitivan broj.'),

    cena: z.number({ invalid_type_error: 'Cena mora biti broj.' })
        .min(0, 'Cena ne sme biti negativna.'),

    slika: z.string()
        .trim()
        .max(5000, 'Putanja do slike ne sme biti duža od 5000 karaktera.'),

    is_subscription: z.union([z.literal(0), z.literal(1)])
        .optional()
        .default(0),

    sekcije: z.union([
        z.array(z.string().max(200)),
        z.string().max(5000)       // JSON string array
    ]).optional()
}).strict();

// =============================================
// PUT /api/kursevi/:id - Ažuriranje kursa
// =============================================
const updateKursSchema = z.object({
    naziv: z.string()
        .trim()
        .min(1, 'Naziv ne sme biti prazan.')
        .max(255, 'Naziv kursa ne sme biti duži od 255 karaktera.')
        .optional(),

    opis: z.string()
        .trim()
        .min(1, 'Opis ne sme biti prazan.')
        .max(5000, 'Opis kursa ne sme biti duži od 5000 karaktera.')
        .optional(),

    cena: z.number({ invalid_type_error: 'Cena mora biti broj.' })
        .min(0, 'Cena ne sme biti negativna.')
        .optional(),

    instruktor_id: z.number({ invalid_type_error: 'instruktor_id mora biti broj.' })
        .int()
        .positive()
        .optional(),

    slika: z.string()
        .trim()
        .max(5000, 'Putanja do slike ne sme biti duža od 5000 karaktera.')
        .optional(),

    is_subscription: z.union([z.literal(0), z.literal(1)])
        .optional()
}).strict();

module.exports = {
    createKursSchema,
    updateKursSchema
};
