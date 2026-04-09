'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from './Rezultati.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';




// Importi slika
import img1 from '../images/deliyaslike/deliya2.webp';
import img2 from '../images/deliyaslike/deliya3.webp';
import img3 from '../images/deliyaslike/deliya4.webp';
import img4 from '../images/deliyaslike/deliya5.webp';
import img5 from '../images/deliyaslike/deliya6.webp';
import img6 from '../images/deliyaslike/deliya7.webp';
import img7 from '../images/deliyaslike/deliya8.webp';
import img8 from '../images/deliyaslike/deliya9.webp';
import img9 from '../images/deliyaslike/deliya12.webp';
import img10 from '../images/deliyaslike/deliya13.webp';
import img11 from '../images/deliyaslike/deliya14.webp';
import img12 from '../images/deliyaslike/deliya15.webp';
import img13 from '../images/deliyaslike/deliya16.webp';
import img14 from '../images/deliyaslike/deliya17.webp';

// Pre/Posle slike integrisane u grid
import imgBA_Before from '../images/deliyaslike/deliya10.webp';
import imgBA_After from '../images/deliyaslike/deliya11.webp';

// Video
import videoSource from '../images/deliyaslike/deliyav1.mp4';
import videoPoster from '../images/deliyaslike/videopreview.webp';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Sastavljamo jedan čist niz za grid
const allImages = [
    img1, imgBA_After, img2, img3, img4, img9,
    img10, img5, img6, img11, img7, imgBA_Before,
    img8, img12, img13, img14
];

// Prikazujemo Video + mali broj slika u startu radi performansi (posebno na mobilnom)
const getInitialCount = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) return 1;
    return 3;
};

const Rezultati = () => {
    // Kontrola učitavanja DOM elemenata
    const [isExpanded, setIsExpanded] = useState(false);
    const initialCount = getInitialCount();

    // Isecamo niz na osnovu stanja
    const visibleImages = isExpanded ? allImages : allImages.slice(0, initialCount);

    // Refresh GSAP kada se promeni broj slika
    useEffect(() => {
        ScrollTrigger.refresh();
        const timer = setTimeout(() => ScrollTrigger.refresh(), 500);
        return () => clearTimeout(timer);
    }, [isExpanded]);

    // LAZY AUTOPLAY ZA VIDEO (INTERSECTION OBSERVER)
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Puštamo video tek kad je na ekranu
                    video.play().catch(err => console.log("Video play error:", err));
                } else {
                    // Pauziramo ga kad nije vidljiv radi uštede resursa
                    video.pause();
                }
            },
            { threshold: 0.1 } // 10% vidljivosti je dovoljno da krene
        );

        observer.observe(video);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="rezultati" className={styles.rezultatiWrapper}>
            {/* NASLOV SEKCIJE */}
            <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>
                    <span className={styles.editorialLine}></span>
                    MEDIA SHOWCASE
                </span>
                <h2 className={styles.mainTitle}>ESTETIKA RADA.</h2>
                <p className={styles.subtitle}>
                    Svaki kadar je svedočanstvo preciznosti. Od prvog reza do finalne teksture — istražite vizuelni identitet koji stvaramo na akademiji.
                </p>
            </div>

            {/* EDITORIAL GRID */}
            <div className={styles.archiveContainer}>
                <div className={styles.galleryGrid}>

                    {/* Hero Video - Zauzima veći prostor i uvek je prisutan */}
                    <div className={`${styles.galleryItem} ${styles.videoFeature}`}>
                        <video
                            ref={videoRef}
                            key="hero-video"
                            className={styles.mediaElement}
                            src={videoSource}
                            poster={videoPoster}
                            loop
                            muted
                            playsInline
                            preload="none"
                        />
                    </div>

                    {/* Dinamičko renderovanje slika (7 slika u startu, ostale na klik) */}
                    {visibleImages.map((src, index) => (
                        <div key={index} className={styles.galleryItem}>
                            <img
                                className={styles.mediaElement}
                                src={src}
                                alt={`Rad polaznika ${index + 1}`}
                                loading="lazy"
                                decoding="async" // Prebacuje dekodiranje slika sa main thread-a
                            />
                        </div>
                    ))}
                </div>

                {/* Luksuzno "Load More" dugme - nestaje kada se prikažu sve slike */}
                {!isExpanded && (
                    <div className={styles.actionContainer}>
                        <button
                            className={styles.expandButton}
                            onClick={() => setIsExpanded(true)}
                        >
                            PRIKAŽI CELU ARHIVU
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Rezultati;