import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './BlogPreview.module.css';

// Eksplicitno postavljamo adresu ako .env nije definisan
const API_URL = 'http://localhost:5000/api';

const BlogPreview = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                console.log("Pokušavam da učitam blog sa:", `${API_URL}/blog?limit=4`);
                const response = await axios.get(`${API_URL}/blog?limit=4`);
                console.log("Podaci iz baze:", response.data);
                setPosts(response.data);
                setLoading(false);
            } catch (err) {
                console.error("GREŠKA PRI UČITAVANJU BLOGA:", err);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // UKLANJAMO return null; da bismo videli sekciju
    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Učitavanje žurnala...</div>;

    const feature = posts[0];
    const archives = posts.slice(1, 4);

    return (
        <section id="zurnal" className={styles.sectionContainer}>
            <div className={styles.mainWrapper}>

                <div className={styles.editorialHeader}>
                    <span className={styles.monospaceLabel}>[ ŽURNAL / KULTURA I ZANAT ]</span>
                    <div className={styles.architecturalLine} />
                </div>

                {posts.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                        Trenutno nema objavljenih članaka u bazi.
                    </p>
                )}

                {feature && (
                    <Link to={`/blog/${feature.slug}`} className={styles.featureArticle}>
                        <div className={styles.featureImageWrapper}>
                            <img
                                src={feature.cover_image || '/deliyapocetna.webp'}
                                alt={feature.title}
                                className={styles.featureImage}
                            />
                        </div>

                        <div className={styles.featureContent}>
                            <h2 className={styles.featureTitle}>
                                {feature.title}
                            </h2>
                            <p className={styles.featureExcerpt}>
                                {feature.excerpt}
                            </p>
                            <span className={styles.ctaLink}>
                                ČITAJ DALJE →
                            </span>
                        </div>
                    </Link>
                )}

                <div className={styles.archiveList}>
                    {archives.map((item, index) => (
                        <Link key={index} to={`/blog/${item.slug}`} className={styles.archiveRow}>
                            <span className={styles.archiveDate}>
                                {new Date(item.created_at).toLocaleDateString('sr-RS')}
                            </span>
                            <h3 className={styles.archiveTitle}>{item.title}</h3>
                            <span className={styles.archiveCategory}>{item.category || 'ŽURNAL'}</span>
                        </Link>
                    ))}
                </div>

                {posts.length > 0 && (
                    <Link to="/blog" className={styles.viewAllLink} style={{
                        display: 'block',
                        textAlign: 'center',
                        marginTop: '4rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        color: '#000',
                        letterSpacing: '0.2em',
                        textDecoration: 'none'
                    }}>
                        POGLEDAJ SVE ČLANKE →
                    </Link>
                )}

            </div>
        </section>
    );
};

export default BlogPreview;
