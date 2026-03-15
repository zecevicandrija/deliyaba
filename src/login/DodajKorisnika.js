import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../login/api';
import './DodajKorisnika.css';

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
        <div className="dk-page">
            <div className="dk-container">
                <button className="dk-back-btn" onClick={() => navigate('/instruktor')}>
                    <i className="ri-arrow-left-line"></i> Nazad
                </button>

                <div className="dk-header">
                    <div className="dk-header-icon">
                        <i className="ri-user-add-line"></i>
                    </div>
                    <h1>Dodaj Korisnika</h1>
                    <p>Ručno dodajte novog korisnika i dodelite mu pristup kursu.</p>
                </div>

                <form className="dk-form" onSubmit={handleSubmit}>
                    <div className="dk-form-grid">
                        {/* Ime */}
                        <div className="dk-field">
                            <label htmlFor="ime">
                                <i className="ri-user-line"></i> Ime *
                            </label>
                            <input
                                id="ime"
                                name="ime"
                                type="text"
                                placeholder="Unesite ime"
                                value={form.ime}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Prezime */}
                        <div className="dk-field">
                            <label htmlFor="prezime">
                                <i className="ri-user-line"></i> Prezime *
                            </label>
                            <input
                                id="prezime"
                                name="prezime"
                                type="text"
                                placeholder="Unesite prezime"
                                value={form.prezime}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="dk-field dk-full-width">
                            <label htmlFor="email">
                                <i className="ri-mail-line"></i> Email *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="korisnik@email.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Šifra */}
                        <div className="dk-field">
                            <label htmlFor="sifra">
                                <i className="ri-lock-line"></i> Šifra *
                            </label>
                            <input
                                id="sifra"
                                name="sifra"
                                type="password"
                                placeholder="Unesite šifru"
                                value={form.sifra}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Uloga */}
                        <div className="dk-field">
                            <label htmlFor="uloga">
                                <i className="ri-shield-user-line"></i> Uloga
                            </label>
                            <select id="uloga" name="uloga" value={form.uloga} onChange={handleChange}>
                                <option value="korisnik">Korisnik</option>
                                <option value="instruktor">Instruktor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Datum isteka pretplate */}
                        <div className="dk-field">
                            <label htmlFor="subscription_expires_at">
                                <i className="ri-calendar-line"></i> Pretplata ističe *
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
                        <div className="dk-field">
                            <label htmlFor="kurs_id">
                                <i className="ri-book-open-line"></i> Kurs
                            </label>
                            <select id="kurs_id" name="kurs_id" value={form.kurs_id} onChange={handleChange}>
                                {kursevi.map(k => (
                                    <option key={k.id} value={k.id}>{k.naziv}</option>
                                ))}
                                {kursevi.length === 0 && <option value="1">Motion Akademija (ID: 1)</option>}
                            </select>
                        </div>
                    </div>

                    {/* Feedback */}
                    {feedback.message && (
                        <div className={`dk-feedback ${feedback.type}`}>
                            <i className={feedback.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
                            {feedback.message}
                        </div>
                    )}

                    <button type="submit" className="dk-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <i className="ri-loader-4-line dk-spin"></i> Dodavanje...
                            </>
                        ) : (
                            <>
                                <i className="ri-user-add-line"></i> Dodaj Korisnika
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DodajKorisnika;