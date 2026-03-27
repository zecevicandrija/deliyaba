'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import styles from './Features.module.css';

const Features = ({ navigate }) => {
    const features = [
        {
            id: "01",
            tag: "EDUKACIJA",
            title: '20+ Sati Materijala',
            text: 'Detaljne video lekcije u visokoj rezoluciji koje usmeravaju tvoju tehniku, od osnova fading-a do naprednih stilova.'
        },
        {
            id: "02",
            tag: "BIZNIS",
            title: 'Svi Resursi',
            text: 'Pristup ekskluzivnim poslovnim strukturama, cenovnicima i šablonima za rad sa premium klijentima.'
        },
        {
            id: "03",
            tag: "MREŽA",
            title: 'Pro Community',
            text: 'Zatvoreni krug motivisanih pojedinaca gde analiziramo radove, rešavamo probleme i rastemo zajedno.'
        },
        {
            id: "04",
            tag: "PRESTIŽ",
            title: 'Sertifikat',
            text: 'Zvaničan dokaz o uspešno završenoj Akademiji, prestižan znak koji podiže tvoj autoritet u industriji.'
        },
    ];

    const elegantEase = [0.16, 1, 0.3, 1];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: elegantEase } }
    };

    const headerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const headerItem = {
        hidden: { opacity: 0, y: 50, filter: 'blur(12px)' },
        show: { 
            opacity: 1, 
            y: 0, 
            filter: 'blur(0px)',
            transition: { duration: 1.4, ease: elegantEase } 
        }
    };

    return (
        <section className={styles.section}>
            {/* Tangible Depth via Global Noise */}
            <div className={styles.globalNoise} />

            {/* Central Radial Glow for Depth */}
            <div className={styles.centralGlow} />

            <div className={styles.container}>

                <motion.div
                    className={styles.headerWrapper}
                    variants={headerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <motion.div variants={headerItem} className={styles.badgeWrapper}>
                        <span className={styles.starIcon}>✦</span>
                        <span className={styles.luxuryTag}>PREMIUM PAKET</span>
                        <span className={styles.starIcon}>✦</span>
                    </motion.div>
                    <motion.h2 variants={headerItem} className={styles.mainHeading}>
                        ŠTA SVE <br />
                        <span className={styles.titleAccent}>DOBIJAŠ?</span>
                    </motion.h2>

                    <motion.p variants={headerItem} className={styles.subtitle}>
                        Svaki element pažljivo osmišljen da te izgradi od nule do profesionalca.
                        Ne kupuješ lekcije — ulagaš u sistem koji radi <em>umesto tebe</em>,
                        dok ti gradiš karijeru koja traje.
                    </motion.p>
                </motion.div>

                <motion.div
                    className={styles.featuresGrid}
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {features.map((feature, index) => (
                        <motion.div variants={item} className={styles.cardWrapper} key={index}>
                            <div className={styles.featureCard}>
                                <div className={styles.cardNoise}></div>
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardNumber}>{feature.id}</span>
                                    <div className={styles.tagLineWrapper}>
                                        <div className={styles.tagLine}></div>
                                        <span className={styles.tag}>{feature.tag}</span>
                                    </div>
                                </div>

                                <div className={styles.cardContent}>
                                    <h3 className={styles.title}>{feature.title}</h3>
                                    <p className={styles.text}>{feature.text}</p>
                                </div>
                                {/* Abstract Geometric Decor */}
                                <div className={styles.decorCircle}></div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    className={styles.ctaWrapper}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1, ease: elegantEase }}
                >
                    <button className={styles.ctaButton} onClick={() => navigate && navigate('/')}>
                        <span className={styles.ctaText}>PRIDRUŽI SE AKADEMIJI</span>
                        <div className={styles.ctaIconCircle}>
                            <FiArrowRight />
                        </div>
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default Features;