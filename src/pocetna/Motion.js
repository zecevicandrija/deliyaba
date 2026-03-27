'use client';

import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import styles from './Motion.module.css';

// Import videos
import video1 from '../images/barber3.mp4';
import video2 from '../images/barber4.mp4';
import video3 from '../images/barber3.mp4';
import video4 from '../images/barber4.mp4';

const steps = [
    {
        id: "01",
        title: "UMETNOST FADING-A",
        shortTitle: "MODUL I / SENČENJE",
        spec: "45 MIN VIDEO",
        video: video1,
        features: ["SKIN FADE", "TAPER FADE"],
        colorDots: ["#111", "#8b9fb0"],
        overlayText: "FADE"
    },
    {
        id: "02",
        title: "PRECIZAN RAD",
        shortTitle: "MODUL II / TEHNIKE",
        spec: "1H 20 MIN",
        video: video2,
        features: ["TEKSTURISANJE", "SLOJEVI"],
        colorDots: ["#7f8c8d", "#bdc3c7"]
    },
    {
        id: "03",
        title: "PREMIUM NEGA",
        shortTitle: "MODUL III / ISKUSTVO",
        spec: "55 MIN VIDEO",
        video: video3,
        features: ["BRITVA", "TRETMANI"],
        colorDots: ["#d35400", "#111"]
    },
    {
        id: "04",
        title: "BIZNIS MODEL",
        shortTitle: "MODUL IV / MARKETING",
        spec: "2H MASTERCLASS",
        video: video4,
        features: ["BREND", "KLIJENTI"],
        colorDots: ["#2980b9", "#8e44ad"],
        overlayText: "BIZNIS"
    }
];

const headerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(12px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] }
    }
};

export default function Motion() {
    return (
        <section className={styles.showcaseSection} id="edukacija">
            {/* Tangible Depth via Global Noise */}
            <div className={styles.globalNoise} />

            <div className={styles.container}>

                {/* Editorial Premium Header */}
                <motion.div
                    className={styles.sectionHeader}
                    variants={headerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <motion.div variants={itemVariants} className={styles.badgeWrapper}>
                        <span className={styles.starIcon}>✦</span>
                        <span className={styles.luxuryTag}>SISTEM RADA</span>
                        <span className={styles.starIcon}>✦</span>
                    </motion.div>
                    <motion.h2 variants={itemVariants} className={styles.mainHeading}>
                        TVOJ PUT DO<br />
                        <span className={styles.titleAccent}>MAJSTORSTVA.</span>
                    </motion.h2>

                    <motion.p variants={itemVariants} className={styles.subtitle}>
                        Transformiši svoje veštine kroz pažljivo dizajniran program u četiri faze. Od osnova do premium servisa, <em>usvoji principe</em> koji odvajaju prosečne od najboljih.
                    </motion.p>
                </motion.div>

                {/* Grid Container */}
                <div className={styles.bentoGrid}>
                    {steps.map((step, index) => {
                        const isLarge = index === 0 || index === 3;

                        return (
                            <motion.div
                                key={step.id}
                                className={`${styles.cardWrapper} ${isLarge ? styles.largeCard : styles.smallCard}`}
                                initial={{ opacity: 0, scale: 0.98, y: 30 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true, margin: "0px" }}
                                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className={styles.videoShape}>
                                    <video
                                        src={step.video}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className={styles.videoPlayer}
                                    />
                                    {/* Large Card Details Overlay (Sci-Fi Aesthetic) */}
                                    {isLarge && (
                                        <div className={styles.largeCardOverlay}>
                                            <div className={styles.overlayBottomRow}>
                                                <h3 className={styles.overlayTitle}>{step.overlayText}</h3>

                                                <div className={styles.priceTag}>
                                                    <div className={styles.priceIcon}><FiArrowRight /></div>
                                                    <div className={styles.priceLabelStack}>
                                                        <span className={styles.priceLabel}>EXPLORE</span>
                                                        <span className={styles.priceValue}>MODULE</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Decorative Background typo */}
                                            <div className={styles.bgTypo}>{step.overlayText}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Info Box Below Card */}
                                <div className={styles.cardInfo}>
                                    <h4 className={styles.cardTitle}>{step.title}</h4>
                                    <p className={styles.cardSubtitle}>{step.shortTitle}</p>

                                    <div className={styles.techDetails}>
                                        <div className={styles.features}>
                                            {step.features.map((feat, i) => (
                                                <div key={i} className={styles.featureItem}>
                                                    <span
                                                        className={styles.dot}
                                                        style={{ backgroundColor: step.colorDots[i] }}
                                                    />
                                                    {feat}
                                                </div>
                                            ))}
                                        </div>
                                        <div className={styles.techSpec}>{step.spec}</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
