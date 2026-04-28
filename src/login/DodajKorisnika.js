import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../login/api';
import styles from './DodajKorisnika.module.css';
import { RiArrowLeftLine, RiUserLine, RiMailLine, RiLockLine, RiShieldUserLine, RiCalendarLine, RiBookOpenLine, RiCheckLine, RiErrorWarningLine, RiLoader4Line, RiUserAddLine } from 'react-icons/ri';

const DodajKorisnika = () => {
    const navigate = useNavigate();
    const [kursevi, setKursevi] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const [form, setForm] = useState({
        ime: '',
        prezime: '',
        email: '',
        sifra: '',
        uloga: 'korisnik',
        subscription_expires_at: '',
        kurs_id: '1',
    });

    // Dohvati kurseve za dropdown
    useEffect(() => {
        const fetchKursevi = async () => {
            try {
                const response = await api.get('/api/kursevi');
                setKursevi(response.data);
                if (response.data.length > 0 && !form.kurs_id) {
                    setForm(prev => ({ ...prev, kurs_id: String(response.data[0].id) }));
                }
            } catch (err) {
                console.error('Greška pri dohvatanju kurseva:', err);
            }
        };
        fetchKursevi();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: '', message: '' });

        if (!form.ime || !form.prezime || !form.email || !form.sifra) {
            setFeedback({ type: 'error', message: 'Molimo popunite sva obavezna polja.' });
            return;
        }

        if (!form.subscription_expires_at) {
            setFeedback({ type: 'error', message: 'Molimo unesite datum isteka pretplate.' });
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Kreiraj korisnika
            const korisnikResponse = await api.post('/api/korisnici', {
                ime: form.ime,
                prezime: form.prezime,
                email: form.email,
                sifra: form.sifra,
                uloga: form.uloga,
                subscription_expires_at: form.subscription_expires_at,
                subscription_status: 'active',
            });

            const noviKorisnikId = korisnikResponse.data.userId;

            // 2. Upiši kupovinu (poveži korisnika sa kursom)
            if (form.kurs_id) {
                await api.post('/api/kupovina', {
                    korisnik_id: noviKorisnikId,
                    kurs_id: parseInt(form.kurs_id),
                    popust_id: null,
                });
            }

            setFeedback({
                type: 'success',
                message: `Korisnik "${form.ime} ${form.prezime}" uspešno dodat sa ID: ${noviKorisnikId} i upisan u kurs.`,
            });

            // Reset forme
            setForm({
                ime: '',
                prezime: '',
                email: '',
                sifra: '',
                uloga: 'korisnik',
                subscription_expires_at: '',
                kurs_id: kursevi.length > 0 ? String(kursevi[0].id) : '1',
            });
        } catch (error) {
            console.error('Greška pri dodavanju korisnika:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Došlo je do greške na serveru.';
            setFeedback({ type: 'error', message: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.watermark}>Deliya</div>
            
            <div className={styles.container}>
                <button className={styles.backBtn} onClick={() => navigate('/instruktor')}>
                    <RiArrowLeftLine /> Nazad na Tablu
                </button>

                <header className={styles.header}>
                    <div className={styles.badge}>
                        <span className={styles.editorialLine}></span>
                        <span>Administracija Korisnika</span>
                    </div>
                    <h1 className={styles.title}>Dodaj Korisnika</h1>
                    <p className={styles.subtitle}>Ručno kreiranje novih profila i dodeljivanje pristupa edukativnim materijalima.</p>
                </header>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        {/* Ime */}
                        <div className={styles.field}>
                            <label htmlFor="ime">
                                <RiUserLine /> Ime *
                            </label>
                            <input
                                id="ime"
                                name="ime"
                                type="text"
                                placeholder="Unesite ime polaznika"
                                value={form.ime}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Prezime */}
                        <div className={styles.field}>
                            <label htmlFor="prezime">
                                <RiUserLine /> Prezime *
                            </label>
                            <input
                                id="prezime"
                                name="prezime"
                                type="text"
                                placeholder="Unesite prezime polaznika"
                                value={form.prezime}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <label htmlFor="email">
                                <RiMailLine /> Protokol Email *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="korisnik@domain.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Šifra */}
                        <div className={styles.field}>
                            <label htmlFor="sifra">
                                <RiLockLine /> Pristupna Šifra *
                            </label>
                            <input
                                id="sifra"
                                name="sifra"
                                type="password"
                                placeholder="Izaberite sigurnu lozinku"
                                value={form.sifra}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Uloga */}
                        <div className={styles.field}>
                            <label htmlFor="uloga">
                                <RiShieldUserLine /> Nivo Pristupa
                            </label>
                            <select id="uloga" name="uloga" value={form.uloga} onChange={handleChange}>
                                <option value="korisnik">Korisnik (Student)</option>
                                <option value="instruktor">Instruktor</option>
                                <option value="admin">Sistemski Admin</option>
                            </select>
                        </div>

                        {/* Datum isteka pretplate */}
                        <div className={styles.field}>
                            <label htmlFor="subscription_expires_at">
                                <RiCalendarLine /> Expiration Date *
                            </label>
                            <input
                                id="subscription_expires_at"
                                name="subscription_expires_at"
                                type="datetime-local"
                                value={form.subscription_expires_at}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Kurs */}
                        <div className={styles.field}>
                            <label htmlFor="kurs_id">
                                <RiBookOpenLine /> Dodeljeni Kurs
                            </label>
                            <select id="kurs_id" name="kurs_id" value={form.kurs_id} onChange={handleChange}>
                                {kursevi.map(k => (
                                    <option key={k.id} value={k.id}>{k.naziv}</option>
                                ))}
                                {kursevi.length === 0 && <option value="1">Akademija (ID: 1)</option>}
                            </select>
                        </div>
                    </div>

                    {/* Feedback */}
                    {feedback.message && (
                        <div className={`${styles.feedback} ${styles[feedback.type]}`}>
                            {feedback.type === 'success' ? <RiCheckLine /> : <RiErrorWarningLine />}
                            {feedback.message}
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <RiLoader4Line className={styles.spin} /> Autorizacija...
                            </>
                        ) : (
                            <>
                                <RiUserAddLine /> Finalizuj Dodavanje
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DodajKorisnika;