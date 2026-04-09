import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BlogCard from './BlogCard';
import styles from './BlogList.module.css';

const API_URL = 'http://localhost:5000/api';

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${API_URL}/blog`);
                setPosts(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching blog posts:', err);
                setError('Neuspešno učitavanje žurnala. Molimo pokušajte ponovo kasnije.');
                setLoading(false);
            }
        };

        fetchPosts();
        
        // Pomicanje na vrh pri učitavanju stranice
        window.scrollTo(0, 0);
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loader}>Učitavanje...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainWrapper}>
                <header className={styles.headerSection}>
                    <span className={styles.label}>[ ŽURNAL / KULTURA I ZANAT ]</span>
                    <h1 className={styles.title}>ODABRANA <br />POGLAVLJA.</h1>
                </header>

                {error ? (
                    <div className={styles.emptyState}>{error}</div>
                ) : posts.length === 0 ? (
                    <div className={styles.emptyState}>Trenutno nema objavljenih članaka.</div>
                ) : (
                    <div className={styles.grid}>
                        {posts.map(post => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogList;
