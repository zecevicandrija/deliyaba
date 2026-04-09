import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { srLatn } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import styles from './BlogDetails.module.css';

const API_URL = 'http://localhost:5000/api';

const BlogDetails = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`${API_URL}/blog/${slug}`);
                setPost(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching blog post:', err);
                setError('Članak nije pronađen ili je došlo do greške pri učitavanju.');
                setLoading(false);
            }
        };

        fetchPost();
        
        // Pomicanje na vrh pri učitavanju nove stranice
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loader}>Učitavanje članka...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className={styles.container}>
                <div className={styles.mainWrapper}>
                    <div className={styles.errorSection}>
                        <h1 className={styles.title}>404. POGLAVLJE NIJE PRONAĐENO.</h1>
                        <Link to="/blog" className={styles.backLink}>
                            <ArrowLeft size={20} className={styles.backArrow} />
                            POVRATAK NA ŽURNAL
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const formattedDate = format(new Date(post.created_at), 'dd. MMMM yyyy.', { locale: srLatn });

    return (
        <article className={styles.container}>
            <Helmet>
                <title>{`${post.title} | Žurnal – Deliya`}</title>
                <meta name="description" content={post.excerpt} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                {post.cover_image && <meta property="og:image" content={post.cover_image} />}
            </Helmet>

            <div className={styles.mainWrapper}>
                <header className={styles.header}>
                    <span className={styles.label}>[ {post.category || 'ŽURNAL'} / ANALIZA ]</span>
                    <h1 className={styles.title}>{post.title}</h1>
                </header>

                <div className={styles.meta}>
                    <span className={styles.author}>M. Deliya</span>
                    <span className={styles.date}>{formattedDate}</span>
                </div>

                {post.cover_image && (
                    <div className={styles.coverImageWrapper}>
                        <img 
                            src={post.cover_image} 
                            alt={post.title} 
                            className={styles.coverImage} 
                        />
                    </div>
                )}

                <div className={styles.contentBody}>
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                <Link to="/blog" className={styles.backLink}>
                    <ArrowLeft size={20} className={styles.backArrow} />
                    <span>NAZAD NA LISTU ČLANAKA</span>
                </Link>
            </div>
        </article>
    );
};

export default BlogDetails;
