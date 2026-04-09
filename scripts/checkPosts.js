const db = require('../db');

async function checkBlogPosts() {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM blog_posts WHERE is_published = 1');
    console.log(`Number of published posts: ${rows[0].count}`);
    process.exit(0);
  } catch (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
}

checkBlogPosts();
