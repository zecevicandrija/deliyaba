'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus, FiArrowRight } from 'react-icons/fi';
import styles from './FAQ.module.css';

// Logotipi
import visaSecure from '../images/logotipi/visa-secure_blu_72dpi.jpg';
import mcIdCheck from '../images/logotipi/mc_idcheck_hrz_rgb_pos.png';
import maestro from '../images/logotipi/ms_acc_opt_70_1x.png';
import mastercard from '../images/logotipi/mc_acc_opt_70_1x.png';
import dina from '../images/logotipi/DinaCard znak.jpg';
import visa from '../images/logotipi/Visa_Brandmark_Blue_RGB_2021.png';
import chipcard from '../images/logotipi/ChipCard LOGO 2021_rgb.jpg';

const FAQ = ({ navigate }) => {
    const faqs = [
        {
            q: "Šta izdvaja ovu edukaciju od drugih kurseva za frizere?",
            a: "Ovo nije samo tehnički kurs. Pored vrhunskih tehnika šišanja i fedinga, učimo te poslovanju, marketingu i kako da izgradiš premium brend koji klijenti prepoznaju i cene."
        },
        {
            q: "Da li mi je potrebno prethodno iskustvo?",
            a: "Ne. Akademija je dizajnirana tako da početnike vodi korak po korak do profesionalnog nivoa, a onima koji već rade pomaže da podignu svoje veštine i cene na viši nivo."
        },
        {
            q: "Da li se akademija vremenom ažurira?",
            a: "Apsolutno. Svet barberinga se stalno razvija. Redovno dodajemo nove module koji prate najnovije svetske trendove u stilizovanju, tehnikama i alatima."
        },
        {
            q: "Koliko dugo imam pristup materijalima?",
            a: "Pristup celokupnoj platformi, svim resursima i privatnoj zajednici dobijaš doživotno, uključujući i sva buduća ažuriranja modula."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = index => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const elegantEase = [0.16, 1, 0.3, 1];

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


            <div className={styles.container}>

                <motion.div
                    className={styles.header}
                    variants={headerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <motion.div variants={headerItem} className={styles.badgeWrapper}>
                        <span className={styles.starIcon}>✦</span>
                        <span className={styles.luxuryTag}>INFORMACIJE</span>
                        <span className={styles.starIcon}>✦</span>
                    </motion.div>
                    <motion.h2 variants={headerItem} className={styles.mainHeading}>
                        GLAVNA<br />
                        <span className={styles.titleAccent}>PITANJA.</span>
                    </motion.h2>

                    <motion.p variants={headerItem} className={styles.subtitle}>
                        Sve što treba da znaš pre nego što započneš svoju <em>transformaciju</em>. Bez skrivenih uslova, samo transparentna i kvalitetna edukacija.
                    </motion.p>
                </motion.div>

                <div className={styles.faqList}>
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <motion.div
                                key={index}
                                className={`${styles.faqItem} ${isOpen ? styles.active : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.8, ease: elegantEase }}
                            >
                                <button
                                    className={styles.questionButton}
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <div className={styles.questionContent}>
                                        <span className={styles.indexNumber}>0{index + 1}</span>
                                        <span className={styles.questionText}>{faq.q}</span>
                                    </div>

                                    <div className={`${styles.iconContainer} ${isOpen ? styles.iconOpen : ''}`}>
                                        {isOpen ? <FiMinus /> : <FiPlus />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: elegantEase }}
                                            className={styles.answerWrapper}
                                        >
                                            <div className={styles.answerContent}>
                                                <div className={styles.answerDivider}>
                                                    <span className={styles.starIcon}>✦</span>
                                                    <div className={styles.answerDividerLine} />
                                                </div>
                                                <p>{faq.a}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    className={styles.ctaWrapper}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1, ease: elegantEase }}
                >
                    <button className={styles.ctaButton} onClick={() => navigate && navigate('/')}>
                        <span className={styles.ctaText}>POSTANI MAJSTOR ZANATA</span>
                        <div className={styles.ctaIconCircle}>
                            <FiArrowRight />
                        </div>
                    </button>
                </motion.div>

                {/* Logotipi Plaćanja */}
                <motion.div
                    className={styles.paymentWrapper}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 1, ease: elegantEase }}
                >
                    <div className={styles.logosContainer}>
                        <div className={styles.logosGroup}>
                            <a href="https://rs.visa.com/pay-withvisa/security-and-assistance/protected-everywhere.html" target="_blank" rel="noopener noreferrer">
                                <img src={visaSecure} alt="Visa Secure" className={styles.logoImg} />
                            </a>
                            <a href="http://www.mastercard.com/rs/consumer/credit-cards.html" target="_blank" rel="noopener noreferrer">
                                <img src={mcIdCheck} alt="Mastercard ID Check" className={styles.logoImg} />
                            </a>
                        </div>

                        <div className={styles.logosGroup}>
                            <img src={maestro} alt="Maestro" className={styles.logoImg} />
                            <img src={mastercard} alt="Mastercard" className={styles.logoImg} />
                            <img src={dina} alt="DinaCard" className={styles.logoImg} />
                            <img src={visa} alt="Visa" className={styles.logoImg} />
                            <a href="https://chipcard.rs/ecommerce/" target="_blank" rel="noopener noreferrer">
                                <img src={chipcard} alt="ChipCard" className={styles.logoImg} style={{ height: '35px' }} />
                            </a>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default FAQ;