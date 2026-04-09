import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './CTA.module.css';

const CTA = ({ navigate }) => {
    const buttonRef = useRef(null);
    const textRef = useRef(null);
    const fillRef = useRef(null);

    useEffect(() => {
        const btn = buttonRef.current;

        const handleMouseMove = (e) => {
            const rect = btn.getBoundingClientRect();
            // Računamo poziciju miša u odnosu na centar dugmeta
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Dugme blago ide ka mišu (magnetic efekat)
            gsap.to(btn, {
                x: x * 0.25,
                y: y * 0.25,
                duration: 0.6,
                ease: "power3.out"
            });

            // Tekst se pomera još malo više za blagi parallax efekat
            if (textRef.current) {
                gsap.to(textRef.current, {
                    x: x * 0.15,
                    y: y * 0.15,
                    duration: 0.6,
                    ease: "power3.out"
                });
            }
        };

        const handleMouseLeave = () => {
            // Vraćamo u potpunosti u centar sa rubber-band bouncy efektom
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 1,
                ease: "elastic.out(1, 0.3)"
            });
            if (textRef.current) {
                gsap.to(textRef.current, {
                    x: 0,
                    y: 0,
                    duration: 1,
                    ease: "elastic.out(1, 0.3)"
                });
            }
        };

        btn.addEventListener('mousemove', handleMouseMove);
        btn.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            btn.removeEventListener('mousemove', handleMouseMove);
            btn.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <section id="cta" className={styles.ctaSection}>
            <div className={styles.container}>
                <div className={styles.statusBadge}>
                    [ STATUS PRIJAVA: STROGO OGRANIČEN KAPACITET ]
                </div>

                <h2 className={styles.headline}>
                    POČNI<br className={styles.mobileBreak} /> SVOJU<br className={styles.mobileBreak} /> KARIJERU.
                </h2>

                <div className={styles.buttonWrapper}>
                    <button
                        ref={buttonRef}
                        className={styles.gravityButton}
                        onClick={() => {
                            if (navigate) {
                                navigate('/paket'); // Promeni putanju po potrebi u buducnosti
                            }
                        }}
                    >
                        <div className={styles.buttonFill} ref={fillRef}></div>
                        <span className={styles.buttonText} ref={textRef}>PRIJAVI SE</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CTA;
