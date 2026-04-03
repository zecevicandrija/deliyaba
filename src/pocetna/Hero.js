'use client';

import React, { useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import styles from './Hero.module.css';

const Hero = ({ navigate }) => {
    const containerRef = useRef(null);
    const mirzaRef = useRef(null);
    const titleSolidRef = useRef(null);
    const titleOutlineRef = useRef(null);
    const cardLeftRef = useRef(null);
    const cardRightRef = useRef(null);
    const mobileCardsTrackRef = useRef(null);
    const mobileGlowRef = useRef(null);
    const mobileBgGlowRef = useRef(null);
    const ctaBlockRef = useRef(null);
    const mobileStickyCtaRef = useRef(null);

    // Ref za čuvanje matchMedia instance
    const mmRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const loadGSAP = async () => {
            try {
                const gsapModule = await import('gsap');
                const scrollTriggerModule = await import('gsap/ScrollTrigger');

                const gsap = gsapModule.default || gsapModule;
                const ScrollTrigger = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;

                if (!isMounted) return;
                gsap.registerPlugin(ScrollTrigger);

                // 1. ULAZNA ANIMACIJA
                const entranceTl = gsap.timeline({ delay: 0.1 });
                entranceTl
                    .fromTo(titleSolidRef.current,
                        { y: 80, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out' }
                    )
                    .fromTo(titleOutlineRef.current,
                        { y: 80, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out' },
                        '-=0.9'
                    )
                    .fromTo(mirzaRef.current,
                        { y: 60, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out' },
                        '-=0.8'
                    );

                // 2. GSAP MATCH MEDIA 
                mmRef.current = gsap.matchMedia();

                mmRef.current.add("(min-width: 769px)", () => {
                    // DESKTOP SCROLLYTELLING
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: 'top top',
                            end: 'bottom bottom',
                            scrub: 1.2,
                        }
                    });

                    tl.fromTo(mirzaRef.current,
                        { scale: 1, y: 0 },
                        { scale: 1.15, y: '4%', duration: 0.30, ease: 'none' }, 0
                    )
                        .fromTo(titleSolidRef.current,
                            { y: 0, opacity: 1 },
                            { y: '-35%', opacity: 0, duration: 0.30, ease: 'power2.in' }, 0
                        )
                        .fromTo(titleOutlineRef.current,
                            { y: 0, opacity: 1 },
                            { y: '35%', opacity: 0, duration: 0.30, ease: 'power2.in' }, 0
                        )
                        .fromTo(cardLeftRef.current,
                            { opacity: 0, x: -80, rotateY: -25 },
                            { opacity: 1, x: 0, rotateY: 0, duration: 0.25, ease: 'power2.out' }, 0.30
                        )
                        .fromTo(cardRightRef.current,
                            { opacity: 0, x: 80, rotateY: 25 },
                            { opacity: 1, x: 0, rotateY: 0, duration: 0.25, ease: 'power2.out' }, 0.35
                        )
                        .to(cardLeftRef.current,
                            { rotateY: 8, rotateX: -3, duration: 0.20, ease: 'sine.inOut' }, 0.50
                        )
                        .to(cardRightRef.current,
                            { rotateY: -8, rotateX: 3, duration: 0.20, ease: 'sine.inOut' }, 0.50
                        )
                        .to([cardLeftRef.current, cardRightRef.current],
                            { opacity: 0, duration: 0.12, ease: 'power1.in' }, 0.68
                        )
                        .to(mirzaRef.current,
                            { y: '-12%', opacity: 0, scale: 1.0, duration: 0.30, ease: 'power2.in' }, 0.70
                        )
                        .fromTo(ctaBlockRef.current,
                            { opacity: 0, y: 60 },
                            { opacity: 1, y: 0, duration: 0.25, ease: 'expo.out' }, 0.80
                        );
                });

                mmRef.current.add("(max-width: 768px)", () => {
                    // MOBILE SCROLLYTELLING
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: 'top top',
                            end: 'bottom bottom',
                            scrub: 1.0,
                        }
                    });

                    tl.to([titleSolidRef.current, titleOutlineRef.current],
                        { y: '-30%', opacity: 0, duration: 0.28, ease: 'power2.in' }, 0
                    )
                        .to(mirzaRef.current,
                            { scale: 0.72, y: '6%', opacity: 0.35, duration: 0.22, ease: 'power2.inOut' }, 0.25
                        )
                        .fromTo(mobileCardsTrackRef.current,
                            { opacity: 0, y: 30, yPercent: -50 },
                            { opacity: 1, y: 0, yPercent: -50, duration: 0.22, ease: 'power2.out' }, 0.45
                        )
                        .fromTo(mobileGlowRef.current,
                            { opacity: 0, scale: 0.7 },
                            { opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' }, 0.45
                        )
                        .to(mobileCardsTrackRef.current,
                            { opacity: 0, y: -30, yPercent: -50, duration: 0.18, ease: 'power2.in' }, 0.65
                        )
                        .to(mobileGlowRef.current,
                            { opacity: 0, duration: 0.15 }, 0.65
                        )
                        .to(mirzaRef.current,
                            { scale: 1.0, y: '0%', opacity: 1, duration: 0.28, ease: 'power2.out' }, 0.70
                        )
                        .fromTo(ctaBlockRef.current,
                            { opacity: 0, y: -40 },
                            { opacity: 1, y: 0, duration: 0.25, ease: 'expo.out' }, 0.76
                        )
                        .fromTo(mobileStickyCtaRef.current,
                            { opacity: 0, y: 30 },
                            { opacity: 1, y: 0, duration: 0.22, ease: 'expo.out' }, 0.82
                        );
                });

            } catch (error) {
                console.error("GSAP load error:", error);
            }
        };

        loadGSAP();

        return () => {
            isMounted = false;
            if (mmRef.current) {
                mmRef.current.revert();
            }
        };
    }, []);

    return (
        <div className={styles.scrollContainer} ref={containerRef}>
            <div className={styles.canvasWrapper}>

                {/* ── LAYER 1: DEEP BACKGROUND (Slika uklonjena, ostaju efekti) ── */}
                <div className={styles.deepBg}>
                    <div className={styles.bgDimmer} />
                    <div className={styles.noiseOverlay} />
                    <div className={styles.mobileBgGlow} ref={mobileBgGlowRef} />
                </div>

                {/* ── LAYER 2: SOLID TITLE "OVLADAJ" ── */}
                <div className={styles.titleSolidWrapper} ref={titleSolidRef}>
                    <span className={styles.titleSolid}>OVLADAJ</span>
                </div>

                {/* ── LAYER 3: MIRZA PNG CUTOUT ── */}
                <div className={styles.mirzaCenterAnchor}>
                    <div className={styles.mirzaWrapper} ref={mirzaRef}>
                        <img
                            src="/delijaa.webp"
                            srcSet="/delijaa.webp 1200w"
                            sizes="(max-width: 768px) 100vw, 864px"
                            alt="Mirza Deliya"
                            className={styles.mirzaImg}
                            fetchPriority="high"
                            loading="eager"
                            width="864"
                            height="1296"
                        />
                    </div>
                </div>

                {/* ── LAYER 4: OUTLINE TITLE "ZANATOM" ── */}
                <div className={styles.titleOutlineWrapper} ref={titleOutlineRef}>
                    <span className={styles.titleOutline}>ZANATOM</span>
                </div>

                {/* ── LAYER 5: GLOSSY CARDS ── */}
                <div
                    className={`${styles.glossyCard} ${styles.cardLeft} ${styles.desktopOnly}`}
                    ref={cardLeftRef}
                >
                    <div className={styles.cardInner}>
                        <div className={styles.cardGlossSheen} />
                        <div className={styles.cardDot} />
                        <h3 className={styles.cardTitle}>REZULTATI<br />KOJI SE VIDE</h3>
                        <p className={styles.cardDesc}>
                            Svaki rez je merljiv. Napredak je vidljiv od prvog dana — kroz tehniku, preciznost i samopouzdanje koje rasteš svaki čas.
                        </p>
                        <div className={styles.cardAccent} />
                    </div>
                </div>

                <div
                    className={`${styles.glossyCard} ${styles.cardRight} ${styles.desktopOnly}`}
                    ref={cardRightRef}
                >
                    <div className={styles.cardInner}>
                        <div className={styles.cardGlossSheen} />
                        <div className={styles.cardDot} />
                        <h3 className={styles.cardTitle}>DOKAZAN<br />SISTEM</h3>
                        <p className={styles.cardDesc}>
                            Nije improvizacija. Deliya metoda je strukturisana, testirana i dovela stotine učenika do prvog profesionalnog šišanja.
                        </p>
                        <div className={styles.cardAccent} />
                    </div>
                </div>

                {/* Mobile: horizontal snap carousel track */}
                <div
                    className={styles.mobileCardsTrack}
                    ref={mobileCardsTrackRef}
                >
                    <div className={styles.mobileGlow} ref={mobileGlowRef} />
                    <div className={`${styles.glossyCard} ${styles.mobileCard}`}>
                        <div className={styles.cardInner}>
                            <div className={styles.cardGlossSheen} />
                            <div className={styles.cardDot} />
                            <h3 className={styles.cardTitle}>REZULTATI<br />KOJI SE VIDE</h3>
                            <p className={styles.cardDesc}>
                                Svaki rez je merljiv. Napredak je vidljiv od prvog dana — kroz tehniku, preciznost i samopouzdanje koje rasteš svaki čas.
                            </p>
                            <div className={styles.cardAccent} />
                        </div>
                    </div>
                    <div className={`${styles.glossyCard} ${styles.mobileCard}`}>
                        <div className={styles.cardInner}>
                            <div className={styles.cardGlossSheen} />
                            <div className={styles.cardDot} />
                            <h3 className={styles.cardTitle}>DOKAZAN<br />SISTEM</h3>
                            <p className={styles.cardDesc}>
                                Nije improvizacija. Deliya metoda je strukturisana, testirana i dovela stotine učenika do prvog profesionalnog šišanja.
                            </p>
                            <div className={styles.cardAccent} />
                        </div>
                    </div>
                </div>

                {/* ── LAYER 6: CTA BLOCK ── */}
                <div className={styles.ctaBlock} ref={ctaBlockRef}>
                    <span className={styles.ctaLabel}>[ TVOJA KARIJERA POKREĆE SE OVDE ]</span>
                    <h2 className={styles.ctaHeading}>PODIGNI SVOJ<br />STANDARD.</h2>
                    <p className={styles.ctaSubtitle}>
                        Od početnika do sigurnog barbera — kroz jasan sistem rada i posvećenu praksu.
                    </p>
                    <button
                        className={`${styles.ctaButton} ${styles.desktopOnly}`}
                        onClick={() => navigate('/paket')}
                    >
                        POČNI DANAS
                    </button>
                </div>

                {/* ── MOBILE STICKY CTA BUTTON ── */}
                <div className={styles.mobileStickyCtaBar} ref={mobileStickyCtaRef}>
                    <button
                        className={styles.mobileStickyBtn}
                        onClick={() => navigate('/paket')}
                    >
                        POČNI DANAS
                    </button>
                </div>

                {/* ── SCROLL ARROW ── */}
                <div className={styles.scrollArrowWrapper}>
                    <div className={styles.bouncingArrow}>
                        <FiChevronDown />
                    </div>
                </div>

                {/* Decorative frame corners */}
                <div className={styles.frameDecoration}>
                    <div className={`${styles.frameCorner} ${styles.topLeft}`} />
                    <div className={`${styles.frameCorner} ${styles.topRight}`} />
                    <div className={`${styles.frameCorner} ${styles.bottomLeft}`} />
                    <div className={`${styles.frameCorner} ${styles.bottomRight}`} />
                </div>

            </div>
        </div>
    );
};

export default Hero;