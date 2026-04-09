import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { srLatn } from 'date-fns/locale';
import styles from './BlogCard.module.css';

const BlogCard = ({ post }) => {
    // Formatiranje datuma na srpskom jeziku
    const formattedDate = format(new Date(post.created_at), 'dd. MMM yyyy.', { locale: srLatn });

    return (
        <Link to={`/blog/${post.slug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <img 
                    src={post.cover_image || '/images/default-blog.jpg'} 
                    alt={post.title} 
                    className={styles.image} 
                    loading="lazy"
                />
            </div>
            
            <div className={styles.meta}>
                <span className={styles.category}>{post.category || 'Žurnal'}</span>
                <span className={styles.date}>{formattedDate}</span>
            </div>

            <h3 className={styles.title}>{post.title}</h3>
            
            <p className={styles.excerpt}>{post.excerpt}</p>
            
            <div className={styles.cta}>
                ČITAJ DALJE
            </div>
        </Link>
    );
};

export default BlogCard;
