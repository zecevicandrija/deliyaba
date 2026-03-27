'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 81;

function getFramePath(index) {
    const num = String(index).padStart(3, '0');
    return require(`../images/deliyaframes2/ezgif-frame-${num}.jpg`);
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

const Hero = ({ navigate }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const imagesRef = useRef([]);
    const targetFrameRef = useRef(0);
    const currentFrameRef = useRef(0);
    const rafIdRef = useRef(null);

    const [loadProgress, setLoadProgress] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Preload all frames
    useEffect(() => {
        let loaded = 0;
        const images = [];
        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                loaded++;
                setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
                if (loaded === FRAME_COUNT) setIsLoaded(true);
            };
            img.onerror = () => {
                loaded++;
                setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
                if (loaded === FRAME_COUNT) setIsLoaded(true);
            };
            images.push(img);
        }
        imagesRef.current = images;
    }, []);

    // Canvas render — DPR + object-fit COVER
    const renderFrame = useCallback((index) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const img = imagesRef.current[Math.round(Math.min(Math.max(index, 0), FRAME_COUNT - 1))];
        if (!img || !img.complete || !img.naturalWidth) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const w = window.innerWidth;
        const h = window.innerHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        // Cover algorithm
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = w / h;
        let dw, dh, dx, dy;
        if (canvasRatio > imgRatio) {
            dw = w; dh = w / imgRatio;
            dx = 0; dy = (h - dh) / 2;
        } else {
            dh = h; dw = h * imgRatio;
            dx = (w - dw) / 2; dy = 0;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            // Animacija ulaska teksta odozdo sa Clip Path-om
            gsap.fromTo([`.${styles.titleLayer1}`, `.${styles.titleLayer2}`, `.${styles.topLabel}`, `.${styles.canvasSubtitle}`],
                { y: 100, opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
                {
                    y: 0,
                    opacity: 1,
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                    duration: 1.2,
                    ease: 'expo.out',
                    delay: 0.2 
                }
            );
        }
    }, [isLoaded]);

    // LERP loop
    useEffect(() => {
        if (!isLoaded) return;

        const isMobile = window.innerWidth <= 1024;
        const lerpFactor = isMobile ? 0.02 : 0.01;

        const tick = () => {
            const diff = Math.abs(currentFrameRef.current - targetFrameRef.current);
            if (diff > 0.01) {
                currentFrameRef.current = lerp(currentFrameRef.current, targetFrameRef.current, lerpFactor);
                renderFrame(currentFrameRef.current);
            }
            rafIdRef.current = requestAnimationFrame(tick);
        };

        rafIdRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, [isLoaded, renderFrame]);

    // GSAP ScrollTrigger
    useEffect(() => {
        if (!isLoaded) return;
        renderFrame(0);

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.5,
                    onUpdate: (self) => {
                        targetFrameRef.current = self.progress * (FRAME_COUNT - 1);
                    },
                }
            });

            // Title fades out from 0% to 15% progress
            tl.fromTo(`.${styles.overlayTitle}`,
                { opacity: 1, scale: 1, filter: 'blur(0px)' },
                {
                    opacity: 0,
                    scale: 1.3,
                    filter: 'blur(12px)',
                    duration: 0.15,
                    ease: 'power2.in'
                },
                0
            );

            // Mid fades in from 25% to 40%
            tl.fromTo(`.${styles.overlayMid}`,
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: 0.15, ease: 'power1.out' },
                0.25
            );

            // Mid fades out from 45% to 55%
            tl.to(`.${styles.overlayMid}`,
                { opacity: 0, y: -60, duration: 0.10, ease: 'power1.in' },
                0.45
            );

            // End fades in from 60% to 75%
            tl.fromTo(`.${styles.overlayEnd}`,
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: 0.15, ease: 'power1.out' },
                0.60
            );
        }, containerRef);

        let lastWidth = window.innerWidth;
        const handleResize = () => {
            renderFrame(currentFrameRef.current);
            if (window.innerWidth !== lastWidth) {
                lastWidth = window.innerWidth;
                ScrollTrigger.refresh();
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            ctx.revert();
            window.removeEventListener('resize', handleResize);
        };
    }, [isLoaded, renderFrame]);

    return (
        <>
            {/* LOADING SCREEN */}
            {!isLoaded && (
                <div className={styles.loadingScreen}>
                    <div className={styles.loaderContent}>
                        <div className={styles.loaderLogo}>DELIYA</div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${loadProgress}%` }}
                            />
                        </div>
                        <span className={styles.progressText}>{loadProgress}%</span>
                    </div>
                </div>
            )}

            {/* SCROLLYTELLING — tall container, sticky canvas */}
            <div className={styles.scrollContainer} ref={containerRef}>
                <div className={styles.canvasWrapper}>

                    <canvas ref={canvasRef} className={styles.stickyCanvas} />

                    {/* PREMIJUM OVERLAY ZA BOLJU ČITLJIVOST TEKSTA */}
                    <div className={styles.canvasOverlay} />
                    {/* FILM GRAIN - DODATNA TEKSTURA */}
                    <div className={styles.noiseOverlay} />

                    {/* DEKORATIVNI EKRANSKI OKVIR */}
                    <div className={styles.frameDecoration}>
                        <div className={`${styles.frameCorner} ${styles.topLeft}`} />
                        <div className={`${styles.frameCorner} ${styles.topRight}`} />
                        <div className={`${styles.frameCorner} ${styles.bottomLeft}`} />
                        <div className={`${styles.frameCorner} ${styles.bottomRight}`} />
                        <div className={styles.frameBorderLeft} />
                        <div className={styles.frameBorderRight} />
                    </div>

                    {/* TEXT STACK: ISPRED MAŠINICE (Z-Index 10) */}
                    <div className={styles.overlayTitle}>
                        <div className={styles.heroTextContainer}>
                            <div className={styles.topLabelWrapper}>
                                <span className={styles.topLabel}>DELIYA MASTERCLASS</span>
                            </div>
                            <h1 className={styles.titleLayer1}>
                                OVLADAJ
                            </h1>
                            <h1 className={styles.titleLayer2}>
                                ZANATOM.
                            </h1>
                            <p className={styles.canvasSubtitle}>
                                Od početnika do sigurnog barbera kroz jasan sistem rada i praksu.
                            </p>
                        </div>
                        <div className={styles.scrollArrowWrapper}>
                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <FiChevronDown />
                            </motion.div>
                        </div>
                    </div>

                    <div className={styles.overlayMid}>
                        <div className={`${styles.glossyCard} ${styles.cardTopLeft}`}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardDot}></div>
                                <h3 className={styles.cardTitle}>BEZ KOMPROMISA</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.cardValueWrapper}>
                                    <span className={styles.cardValue}>0.1</span>
                                    <div className={styles.cardUnitWrapper}>
                                        <span className={styles.cardUnit}>mm</span>
                                        <span className={styles.cardSubUnit}>PRECISION</span>
                                    </div>
                                </div>
                                <p className={styles.cardDesc}>
                                    Preciznost u svakom rezu. Naš fokus je na najsitnijim
                                    detaljima koji odvajaju dobre od najboljih majstora.
                                </p>
                            </div>
                            <div className={styles.cardGraphic}></div>
                        </div>

                        <div className={`${styles.glossyCard} ${styles.cardBotRight}`}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardDot}></div>
                                <h3 className={styles.cardTitle}>FOKUS NA PRAKSU</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.cardValueWrapper}>
                                    <span className={styles.cardValue}>100</span>
                                    <div className={styles.cardUnitWrapper}>
                                        <span className={styles.cardUnit}>%</span>
                                        <span className={styles.cardSubUnit}>PRAKTIČAN RAD</span>
                                    </div>
                                </div>
                                <p className={styles.cardDesc}>
                                    Zaboravi na suvu teoriju. Učiš direktno kroz rad na modelima
                                    uz posvećeno mentorstvo od prvog do poslednjeg poteza.
                                </p>
                            </div>
                            <div className={styles.cardGraphic}></div>
                        </div>
                    </div>

                    <div className={styles.overlayEnd}>
                        <div className={styles.heroTextContainerCentered}>
                            <div className={styles.topLabelWrapper}>
                                <span className={styles.topLabel}>TVOJA KARIJERA</span>
                            </div>
                            <h1 className={`${styles.titleLayer1} ${styles.titleEnd1}`}>
                                PODIGNI SVOJ
                            </h1>
                            <h1 className={`${styles.titleLayer2} ${styles.titleEnd2}`}>
                                STANDARD.
                            </h1>

                            <div className={styles.ctaWrapper}>
                                <button className={styles.ctaButton} onClick={() => navigate('/paket')}>
                                    PRIDRUŽI SE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;