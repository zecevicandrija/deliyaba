'use client';

import React from 'react';
import { FiInstagram, FiYoutube, FiArrowUp, FiMail } from 'react-icons/fi';
import styles from './Footer.module.css';
import deliyaLogo from '../images/deliyalogos/White_AC.png';

const Footer = () => {

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerContent}>

                    {/* 1. Brand Column */}
                    <div className={styles.brandColumn}>
                        <img src={deliyaLogo} alt="Deliya Barber Academy" className={styles.footerLogo} />
                        <p className={styles.tagline}>
                            Ekskluzivna edukacija za moderne frizere. Savladaj tehniku, unapredi poslovanje i izgradi premium brend.
                        </p>
                        <div className={styles.contactItem}>
                            <FiMail />
                            <a href="mailto:info@akademija.com" className={styles.contactLink}>info@akademija.com</a>
                        </div>
                    </div>

                    {/* 2. Links Column */}
                    <div className={styles.linksColumn}>
                        <h4>PRAVILA</h4>
                        <div className={styles.linksList}>
                            <a href="/" className={styles.link}>Uslovi Korišćenja</a>
                            <a href="/" className={styles.link}>Politika Privatnosti</a>
                            <a href="/" className={styles.link}>Politika Povraćaja Novca</a>
                        </div>
                    </div>

                    {/* 3. Socials Column */}
                    <div className={styles.socialColumn}>
                        <h4>PRATI NAS</h4>
                        <div className={styles.socialGrid}>
                            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialIcon}>
                                <FiInstagram />
                            </a>
                            <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.socialIcon}>
                                <FiYoutube />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className={styles.footerBottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Barber Akademija. Sva prava zadržana.
                    </p>
                    <div className={styles.bottomRight}>
                        <p className={styles.devCredit}>
                            Dizajn i razvoj: <a href="https://zecevicdev.com" target="_blank" rel="noopener noreferrer" className={styles.devLink}>zecevicdev.com</a>
                        </p>
                        <button onClick={scrollToTop} className={styles.backToTop} aria-label="Back to top">
                            <FiArrowUp />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;