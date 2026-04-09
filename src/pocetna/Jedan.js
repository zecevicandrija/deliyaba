import React from 'react';
import { motion } from 'framer-motion';
import styles from './Jedan.module.css';
import slikaLevo from '../images/deliyaslike/deliya1.webp';
import { FaWhatsapp } from 'react-icons/fa';

const Jedan = () => {
    return (
        <section id="jedan" className={styles.sectionContainer}>
            {/* Premium radijalni prelaz (noise/grid vibe) */}
            <div className={styles.premiumOverlay}></div>

            <div className={styles.splitLayout}>
                <motion.div
                    className={styles.leftColumn}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className={styles.imageWrapper}>
                        <img src={slikaLevo} alt="Fokus i zanat - Mirza" className={styles.moodyImage} />
                        <div className={styles.imageOverlay}></div>

                        <div className={styles.imageCornerBox}>
                            <span className={styles.cornerText}>1:1</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.rightColumn}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className={styles.contentWrapper}>
                        <div className={styles.badgeWrapper}>
                            <div className={styles.aestheticLine}></div>
                            <span className={styles.techLabel}>[ EKSKLUZIVNI PROGRAM ]</span>
                        </div>

                        <h2 className={styles.mainTitle}>
                            SAMO TI.<br />
                            <span className={styles.titleAccent}>I ZANAT.</span>
                        </h2>

                        <p className={styles.hookDescription}>
                            "Nema distrakcija. 1:1 mentorstvo je potpuno hirurški proces gde seciramo tvoj trenutni rad i gradimo sistem tačno po tvojoj meri. Moj fokus je 100% na tvojim rukama, tvojoj tehnici i tvom napretku."
                        </p>

                        <div className={styles.targetAudience}>
                            <h3 className={styles.targetTitle}>ZA KOGA JE OVAJ FORMAT?</h3>
                            <div className={styles.targetList}>
                                <div className={styles.targetItem}>
                                    <span className={styles.itemNumber}>01</span>
                                    <p>Za iskusne berbere koji su "udarili u plafon" i žele da naplate svoj rad premium cenom.</p>
                                </div>
                                <div className={styles.targetItem}>
                                    <span className={styles.itemNumber}>02</span>
                                    <p>Za početnike koji odbijaju da gube mesece na tuđe greške i žele najbrži mogući put do sigurnosti.</p>
                                </div>
                                <div className={styles.targetItem}>
                                    <span className={styles.itemNumber}>03</span>
                                    <p>Za vlasnike salona koji žele da uspostave besprekoran sistem i psihologiju rada sa VIP klijentima.</p>
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/381600000000?text=Dobar%20dan,%20želim%20da%20apliciram%20za%201:1%20mentorstvo.%20Moje%20ime%20je%20"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.ctaButton}
                        >
                            <span className={styles.buttonText}>APLICIRAJ PUTEM WHATSAPP-A</span>
                            <span className={styles.buttonIconWrapper}>
                                <FaWhatsapp className={styles.waIcon} />
                            </span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Jedan;
