'use client';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Rezultati.module.css';
import barber3 from '../images/barber3.mp4';

gsap.registerPlugin(ScrollTrigger);

const MarqueeImages1 = [
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590540179852-2110a54f813a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop",
];

const MarqueeImages2 = [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop",
];

// Duplirano za beskrajan skrol
const Track1 = [...MarqueeImages1, ...MarqueeImages1, ...MarqueeImages1];
const Track2 = [...MarqueeImages2, ...MarqueeImages2, ...MarqueeImages2];

const Rezultati = () => {
    const baSectionRef = useRef(null);
    const baAfterRef = useRef(null);
    const baDividerRef = useRef(null);
    const baLabelRef = useRef(null);

    const videosRef = useRef([]);

    // 2. Pre/Posle Skrol (Skalpel animacija uskladjena s misem)
    useEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: baSectionRef.current,
                    start: 'top top',
                    end: '+=100%',
                    pin: true,
                    scrub: 0.5,
                    anticipatePin: 1,
                }
            });

            // Wipe mask - set duration to 1 so it fills the entire scroll distance
            tl.fromTo(baAfterRef.current,
                { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' },
                { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1, ease: 'power2.inOut' }, 0);

            // Divider movement - set duration to 1 to match
            tl.fromTo(baDividerRef.current,
                { left: '0%' },
                { left: '100%', duration: 1, ease: 'power2.inOut' }, 0);

            // Divider opacity
            tl.fromTo(baDividerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.1, ease: 'power1.out' }, 0);

            tl.to(baDividerRef.current,
                { opacity: 0, duration: 0.1, ease: 'power1.in' }, 0.9); // Starts fading at 90% and finishes at 100%

            // Label text toggle at 80% progress
            tl.to({}, {
                duration: 1,
                onUpdate: () => {
                    const progress = tl.progress();
                    if (baLabelRef.current) {
                        const newText = progress >= 0.5 ? "POSLE" : "PRIJE";
                        if (baLabelRef.current.innerText !== newText) {
                            baLabelRef.current.innerText = newText;
                        }
                    }
                }
            }, 0);

        }, baSectionRef);
        return () => ctx.revert();
    }, []);

    // 4. Hover preko videa
    const handleVideoHover = (index, isHovering) => {
        const vid = videosRef.current[index];
        if (!vid) return;

        // Na mobilnom ovo iskljucujemo
        if (window.innerWidth <= 768) return;

        if (isHovering) {
            vid.muted = false;
            gsap.to(vid, { volume: 1, duration: 1 });
        } else {
            gsap.to(vid, { volume: 0, duration: 1, onComplete: () => { vid.muted = true; } });
        }
    };

    return (
        <section className={styles.rezultatiWrapper}>
            {/* NASLOV SEKCIJE */}
            <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>
                    <span className={styles.editorialLine}></span>
                    DOKAZ KVALITETA
                </span>
                <h2 className={styles.mainTitle}>REZULTATI ČLANOVA.</h2>
            </div>

            {/* 2. PRE/POSLE SKALPEL */}
            <div className={styles.baSection} ref={baSectionRef}>
                <div className={styles.baContainer}>
                    <img className={`${styles.baImg} ${styles.baBefore}`} src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2670&auto=format&fit=crop" alt="Before" />

                    <div className={styles.baAfterWrapper} ref={baAfterRef}>
                        <img className={`${styles.baImg} ${styles.baAfter}`} src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2670&auto=format&fit=crop" alt="After" />
                    </div>
                    <div className={styles.baDivider} ref={baDividerRef}></div>

                    <div className={styles.baStatusLabel} ref={baLabelRef}>
                        PRE
                    </div>
                </div>
            </div>

            {/* 3. ZID RADOVA (MARQUEE) */}
            <div className={styles.marqueeSection}>
                <div className={`${styles.marqueeTrack} ${styles.trackLeft}`}>
                    <div className={styles.marqueeInner}>
                        {Track1.map((src, i) => (
                            <img key={`t1-${i}`} className={styles.marqueeImg} src={src} alt="Rad" />
                        ))}
                    </div>
                </div>
                <div className={`${styles.marqueeTrack} ${styles.trackRight}`}>
                    <div className={styles.marqueeInner}>
                        {Track2.map((src, i) => (
                            <img key={`t2-${i}`} className={styles.marqueeImg} src={src} alt="Rad" />
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. VIDEO SVEDOČANSTVA */}
            <div className={styles.videoSection}>
                <div className={styles.videosGrid}>
                    {[
                        "https://videos.pexels.com/video-files/4122115/4122115-uhd_1440_2560_30fps.mp4",
                        "https://videos.pexels.com/video-files/4122108/4122108-uhd_1440_2560_30fps.mp4",
                        "https://videos.pexels.com/video-files/3998188/3998188-uhd_1440_2560_30fps.mp4"
                    ].map((src, i) => (
                        <div
                            key={i}
                            className={styles.videoWrapper}
                            onMouseEnter={() => handleVideoHover(i, true)}
                            onMouseLeave={() => handleVideoHover(i, false)}
                        >
                            <video
                                ref={el => videosRef.current[i] = el}
                                className={styles.videoPlayer}
                                src={barber3}
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                            <div className={styles.muteTag}>DELIYA</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Rezultati;
