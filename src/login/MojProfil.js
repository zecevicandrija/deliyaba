import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import api from './api';
import styles from './MojProfil.module.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiKey, FiArrowRight, FiCheck, FiMessageCircle, FiX } from 'react-icons/fi';

const MojProfil = () => {
    const { user, logout, setUser: setAuthUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        ime: '',
        prezime: '',
        email: '',
        currentPassword: '',
        newPassword: ''
    });

    const [kupljeniKursevi, setKupljeniKursevi] = useState([]);
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const imaAktivnuPretplatu = user &&
        user.subscription_expires_at &&
        new Date(user.subscription_expires_at) > new Date() &&
        user.subscription_status !== 'expired' &&
        user.subscription_status !== 'payment_failed';

    const fetchData = useCallback(async () => {
        if (user) {
            try {
                const meResponse = await api.get('/api/auth/me');
                setAuthUser(meResponse.data);
                localStorage.setItem('user', JSON.stringify(meResponse.data));
            } catch (e) {
                console.error('Failed to refresh user:', e);
            }

            setFormData({
                ime: user.ime || '',
                prezime: user.prezime || '',
                email: user.email || '',
                currentPassword: '',
                newPassword: ''
            });

            const [kupovinaResult, subResult] = await Promise.allSettled([
                api.get(`/api/kupovina/user/${user.id}`),
                api.get(`/api/subscription/details/${user.id}`)
            ]);

            if (kupovinaResult.status === 'fulfilled') {
                setKupljeniKursevi(kupovinaResult.value.data);
            } else {
                setKupljeniKursevi([]);
            }

            if (subResult.status === 'fulfilled' && subResult.value.data.hasRecurring) {
                setSubscriptionDetails(subResult.value.data.subscription);
            } else {
                setSubscriptionDetails(null);
            }
        }
    }, [user?.id, setAuthUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            const profileUpdateData = {
                ime: formData.ime,
                prezime: formData.prezime,
                email: formData.email,
            };
            if (formData.currentPassword && formData.newPassword) {
                await api.post('/api/auth/change-password', {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                });
            }
            await api.put(`/api/korisnici/${user.id}`, profileUpdateData);

            const response = await api.get('/api/auth/me');
            setAuthUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));

            setMessage('Profil je uspešno ažuriran!');
            setFormData(prevState => ({ ...prevState, currentPassword: '', newPassword: '' }));
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Došlo je do greške.';
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Da li ste sigurni da želite otkazati automatsko produžavanje? Zadržaćete pristup do isteka trenutne pretplate.')) {
            return;
        }

        setCancelLoading(true);
        try {
            await api.post('/api/subscription/cancel');
            const subResponse = await api.get(`/api/subscription/details/${user.id}`);
            if (subResponse.data.hasRecurring) {
                setSubscriptionDetails(subResponse.data.subscription);
            } else {
                setSubscriptionDetails(null);
            }
            const response = await api.get('/api/auth/me');
            setAuthUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            alert('Automatsko produžavanje je uspešno otkazano.');
        } catch (error) {
            console.error('Greška pri otkazivanju pretplate:', error);
            alert('Greška pri otkazivanju pretplate.');
        } finally {
            setCancelLoading(false);
        }
    };

    const handleReactivateSubscription = async () => {
        setCancelLoading(true);
        try {
            await api.post('/api/subscription/reactivate');
            const subResponse = await api.get(`/api/subscription/details/${user.id}`);
            if (subResponse.data.hasRecurring) {
                setSubscriptionDetails(subResponse.data.subscription);
            } else {
                setSubscriptionDetails(null);
            }
            const response = await api.get('/api/auth/me');
            setAuthUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            alert('Automatsko produžavanje je ponovo aktivirano!');
        } catch (error) {
            console.error('Greška pri reaktivaciji pretplate:', error);
            alert('Greška pri reaktivaciji pretplate.');
        } finally {
            setCancelLoading(false);
        }
    };


    if (!user) {
        return (
            <div className={styles.page}>
                <div className={styles.watermark}>Deliya</div>
                <motion.div
                    className={styles.welcomeContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        className={styles.welcomeHeroCard}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className={styles.welcomeGlow} />
                        <motion.div
                            className={styles.welcomeIconBox}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <FiCheck style={{ color: '#fff' }} />
                        </motion.div>

                        <motion.h1
                            className={styles.welcomeTitle}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        >
                            Dobrodošli u <span className={styles.gradientText}>Motion Akademiju</span>
                        </motion.h1>

                        <motion.p
                            className={styles.welcomeSubtitle}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        >
                            Vaša autorizacija je uspešno potvrđena. Dobrodošli u elitnu zajednicu video stvaralaca.
                        </motion.p>
                    </motion.div>

                    <div className={styles.welcomeInfoGrid}>
                        <motion.div
                            className={styles.welcomeInfoCard}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                        >
                            <div className={styles.iconWrapper}><FiMail /></div>
                            <div>
                                <h3>Protokol Email</h3>
                                <p>Proverite vašu pristiglu poštu za login podatke i instrukcije.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className={styles.welcomeInfoCard}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                        >
                            <div className={styles.iconWrapper}><FiKey /></div>
                            <div>
                                <h3>Pristupni Kodovi</h3>
                                <p>Koristite generisanu lozinku za prvi pristup platformi.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className={styles.welcomeInfoCard}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                        >
                            <div className={styles.iconWrapper}><FiMessageCircle /></div>
                            <div>
                                <h3>Discord Hub</h3>
                                <p>Ekskluzivni kanali su sada otvoreni za vašu saradnju.</p>
                            </div>
                        </motion.div>
                    </div>

                    <motion.button
                        className={styles.welcomeCtaBtn}
                        onClick={() => navigate('/login')}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                    >
                        <span>Uđi na Platformu</span>
                        <FiArrowRight />
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.watermark}>Deliya</div>

            <div className={styles.contentWrapper}>
                {/* --- Leva Kartica - Profil --- */}
                <div className={styles.card}>
                    <h2 className={styles.header}>Identitet</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="ime">Ime</label>
                            <input id="ime" name="ime" type="text" value={formData.ime} onChange={handleInputChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="prezime">Prezime</label>
                            <input id="prezime" name="prezime" type="text" value={formData.prezime} onChange={handleInputChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email Adresa</label>
                            <input id="email" name="email" type="email" value={formData.email} disabled className={styles.disabledInput} />
                        </div>
                        <hr className={styles.divider} />
                        <h3 className={styles.subheader}>Sigurnost</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="currentPassword">Stara Šifra</label>
                            <input id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleInputChange} placeholder="Unesite staru šifru" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="newPassword">Nova Šifra</label>
                            <input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} placeholder="Unesite novu šifru" />
                        </div>
                        {message && <p className={styles.message}>{message}</p>}
                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Autorizacija...' : 'Ažuriraj Podatke'}
                        </button>
                    </form>
                </div>

                {/* --- Desna Kartica - Pretplate --- */}
                <div className={styles.card}>
                    <h2 className={styles.header}>Aktivni Programi</h2>
                    {kupljeniKursevi.length > 0 ? (
                        <ul className={styles.pretplataList}>
                            {kupljeniKursevi.map(kurs => (
                                <li key={kurs.id} className={styles.pretplataItem}>
                                    <div className={styles.pretplataInfo}>
                                        <span className={styles.pretplataName}>{kurs.naziv}</span>
                                        <span className={styles.pretplataDate}>
                                            Upisano: {new Date(kurs.datum_kupovine).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className={styles.pretplataStatus}>
                                        {kurs.is_subscription ? (
                                            imaAktivnuPretplatu ? (
                                                <span className={styles.statusActive}>
                                                    Aktivna do: {new Date(user.subscription_expires_at).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <div className={styles.statusExpired}>
                                                    <span>Istekla: {new Date(user.subscription_expires_at).toLocaleDateString()}</span>
                                                    <button onClick={() => navigate('/produzivanje')} className={styles.produziBtn}>
                                                        Produži
                                                    </button>
                                                </div>
                                            )
                                        ) : (
                                            <span className={styles.statusPermanent}>Trajni pristup</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.noResults}>
                            {user.subscription_expires_at ? (
                                new Date(user.subscription_expires_at) < new Date() ? (
                                    <>
                                        <p style={{ marginBottom: '10px' }}>Pristup programima je istekao.</p>
                                        <button onClick={() => navigate('/produzivanje')} className={styles.produziBtn}>
                                            Obnovi članstvo
                                        </button>
                                    </>
                                ) : (
                                    <p>Sistemski podaci se ažuriraju...</p>
                                )
                            ) : (
                                <p>Nemate aktivnih upisa na kurs.</p>
                            )}
                        </div>
                    )}

                    {/* Auto-Renewal Section */}
                    {subscriptionDetails && (
                        <div className={styles.renewalSection}>
                            <hr className={styles.divider} />
                            <h3 className={styles.subheader}>Auto-Obnova</h3>

                            {subscriptionDetails.isActive ? (
                                <div>
                                    <div className={styles.renewalInfoRow}>
                                        <span className={styles.renewalLabel}>Naredni Protokol:</span>
                                        <span className={styles.renewalValue}>
                                            {new Date(subscriptionDetails.nextBillingDate).toLocaleDateString('sr-RS')}
                                        </span>
                                    </div>
                                    <div className={styles.renewalInfoRow}>
                                        <span className={styles.renewalLabel}>Iznos:</span>
                                        <span className={styles.renewalAmount}>{subscriptionDetails.amount} RSD</span>
                                    </div>
                                    <button
                                        onClick={handleCancelSubscription}
                                        className={styles.cancelRenewalBtn}
                                        disabled={cancelLoading}
                                    >
                                        <FiX />
                                        {cancelLoading ? 'Otkazivanje...' : 'Otkaži Auto-Obnovu'}
                                    </button>
                                </div>
                            ) : imaAktivnuPretplatu ? (
                                <div className={styles.renewalCancelledInfo}>
                                    <p className={styles.cancelledMessage}>
                                        Auto-obnova je deaktivirana.
                                    </p>
                                    <p style={{ fontSize: '0.8rem' }}>
                                        Pristup prestaje: <strong>{new Date(user.subscription_expires_at).toLocaleDateString('sr-RS')}</strong>
                                    </p>
                                    <button
                                        onClick={handleReactivateSubscription}
                                        className={styles.reactivateBtn}
                                        disabled={cancelLoading}
                                    >
                                        {cancelLoading ? 'Aktivacija...' : 'Ponovo Aktiviraj'}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
            <button onClick={logout} className={styles.logoutBtn}>Odjavi se</button>
        </div>
    );
};

export default MojProfil;