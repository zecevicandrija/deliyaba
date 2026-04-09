import React from 'react';
import styles from './Konsultacije.module.css';
import deliyaImage from '../images/deliyaslike/deliya18.webp';

const Konsultacije = () => {
    return (
        <section id="konsultacije" className={styles.sectionContainer}>
            {/* Top Space for Reset (requested) */}
            <div className={styles.spaceReset} />

            <div className={styles.mainWrapper}>
                <div className={styles.splitLayout}>

                    {/* LEVA KOLONA: KONSULTACIJE (The Hook) */}
                    <div className={styles.leftSalesColumn}>

                        <div className={styles.editorialHeader}>
                            <span className={styles.monospaceLabel}>[ KONSULTACIJE ]</span>
                            <div className={styles.architecturalLine} />
                        </div>

                        <div className={styles.contentAndImage}>
                            <div className={styles.textContent}>
                                <h2 className={styles.heroTitle}>
                                    DA LI JE OVA<br />
                                    AKADEMIJA<br />
                                    <span className={styles.outlineText}>ZA TEBE?</span>
                                </h2>

                                <p className={styles.qualifierText}>
                                    Ne primamo svakoga. Naš cilj je da radimo sa ljudima koji su spremni na disciplinu i ozbiljan rad.
                                    Zakaži besplatne, neobavezujuće konsultacije da vidimo gdje se trenutno nalaziš i da li naš sistem može da te dovede do cilja.
                                </p>

                                <a
                                    href="https://calendly.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.gravityButton}
                                >
                                    ZAKAŽI KONSULTACIJE
                                </a>
                            </div>

                            <div className={styles.imageBox}>
                                <div className={styles.imageOverlay} />
                                <img src={deliyaImage} alt="Deliya Consultation" className={styles.sideImage} />
                            </div>
                        </div>
                    </div>

                    {/* DESNA KOLONA: KONTAKT (The Matrix) */}
                    <div className={styles.rightMatrixColumn}>
                        <div className={styles.matrixContainer}>

                            <div className={styles.matrixRow}>
                                <span className={styles.tinyLabel}>EMAIL</span>
                                <a href="mailto:info@deliya.com" className={styles.matrixValueLink}>
                                    <span className={styles.kineticText}>info@deliya.com</span>
                                </a>
                            </div>

                            <div className={styles.matrixRow}>
                                <span className={styles.tinyLabel}>POZIV / WHATSAPP</span>
                                <a href="tel:+38161234567" className={styles.matrixValueLink}>
                                    +381 61 234 567
                                </a>
                            </div>

                            <div className={styles.matrixRow}>
                                <span className={styles.tinyLabel}>ADRESA</span>
                                <a
                                    href=""
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.matrixValueLink}
                                >
                                    Adresa
                                </a>
                            </div>

                            <div className={styles.matrixRow}>
                                <span className={styles.tinyLabel}>ZAPRATI RAD</span>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.matrixValueInstagram}
                                >
                                    INSTAGRAM
                                </a>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Konsultacije;
