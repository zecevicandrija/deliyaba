import React, { useState, useEffect } from 'react';
import { useAuth } from './auth';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import styles from './Login.module.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [sifra, setSifra] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            await login(email, sifra);
        } catch (error) {
            setShowModal(true);
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.watermark}>DELIYABA</div>
            
            <motion.div
                className={styles.container}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            >
                {/* Header */}
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className={styles.badge}>
                        <span className={styles.editorialLine} />
                        Premium Academy
                    </div>
                    <h1 className={styles.title}>
                        Dobro <span className={styles.gradientText}>došli</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Uđite u svet premium frizerstva
                    </p>
                </motion.div>

                {/* Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    className={styles.form}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            <FiMail className={styles.labelIcon} />
                            Email Adresa
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={styles.input}
                                placeholder="vas@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            <FiLock className={styles.labelIcon} />
                            Lozinka
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className={styles.input}
                                placeholder="••••••••"
                                value={sifra}
                                onChange={(e) => setSifra(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <span>{isLoading ? 'Prijava...' : 'Prijavi se'}</span>
                        <FiArrowRight className={styles.btnIcon} />
                    </motion.button>
                </motion.form>
            </motion.div>

            {/* Error Modal */}
            {showModal && (
                <motion.div
                    className={styles.modalOverlay}
                    onClick={closeModal}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={styles.modalIconBox}>
                            <FiAlertCircle className={styles.modalIcon} />
                        </div>
                        <h3 className={styles.modalTitle}>Greška pri prijavi</h3>
                        <p className={styles.modalText}>
                            Podaci za prijavu nisu ispravni. Molimo Vas da proverite email i lozinku.
                        </p>
                        <button onClick={closeModal} className={styles.modalBtn}>
                            Pokušaj ponovo
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default LoginPage;
