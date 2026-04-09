const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/blog
// @desc    Get all published blog posts (summary for listing)
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        let sql = 'SELECT id, title, slug, excerpt, cover_image, category, created_at FROM blog_posts WHERE is_published = true ORDER BY created_at DESC';
        const params = [];
        
        if (!isNaN(limit) && limit > 0) {
            sql += ' LIMIT ?';
            params.push(limit);
        }

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching blog posts:', err);
        res.status(500).json({ error: 'Greška pri učitavanju bloga.' });
    }
});

// @route   GET /api/blog/:slug
// @desc    Get full blog post by slug
router.get('/:slug', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM blog_posts WHERE slug = ? AND is_published = true',
            [req.params.slug]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Članak nije pronađen.' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching blog post:', err);
        res.status(500).json({ error: 'Greška pri učitavanju članka.' });
    }
});

module.exports = router;
