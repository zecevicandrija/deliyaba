import React, { useState } from 'react';
import { useAuth } from '../login/auth';
import api from '../login/api'; // Koristi centralizovani API klijent
import './DodajKurs.css'; // Uvozimo novi CSS

const DodajKurs = () => {
    const { user } = useAuth();
    const [naziv, setNaziv] = useState('');
    const [opis, setOpis] = useState('');
    const [slika, setSlika] = useState('');
    const [cena, setCena] = useState('');
    // NOVO: Stanje za dinamičko dodavanje sekcija
    const [sekcije, setSekcije] = useState(['']); // Počinjemo sa jednim praznim poljem

    const handleSekcijaChange = (index, event) => {
        const noviNaziviSekcija = [...sekcije];
        noviNaziviSekcija[index] = event.target.value;

        // Ako korisnik kuca u poslednjem polju, dodaj novo prazno polje
        if (index === sekcije.length - 1 && event.target.value !== '') {
            setSekcije([...noviNaziviSekcija, '']);
        } else {
            setSekcije(noviNaziviSekcija);
        }
    };

    const handleRemoveSekcija = (index) => {
        // Ne dozvoli brisanje poslednjeg polja
        if (sekcije.length <= 1) return;
        const noviNaziviSekcija = [...sekcije];
        noviNaziviSekcija.splice(index, 1);
        setSekcije(noviNaziviSekcija);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Korisnik nije prijavljen.');
            return;
        }

        try {
            const response = await api.post('/api/kursevi', {
                naziv,
                opis,
                instruktor_id: user.id,
                cena,
                slika,
                sekcije: sekcije.filter(s => s.trim() !== '')
            });

            if (response.status === 201) {
                alert('Kurs je uspešno dodat!');
                setNaziv('');
                setOpis('');
                setCena('');
                setSlika('');
                setSekcije(['']);
            } else {
                alert('Greška pri dodavanju kursa');
            }
        } catch (error) {
            console.error('Greška:', error);
            alert('Došlo je do greške na serveru.');
        }
    };


    return (
        <div className="dodaj-kurs-container">
            <form className="dodaj-kurs-form" onSubmit={handleSubmit}>
                <h2 className="form-title">Kreiraj Novi Kurs</h2>
                
                <div className="form-group">
                    <label className="form-label">Naziv Kursa:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={naziv}
                        onChange={(e) => setNaziv(e.target.value)}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label className="form-label">Opis Kursa:</label>
                    <textarea
                        className="form-textarea"
                        value={opis}
                        onChange={(e) => setOpis(e.target.value)}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label className="form-label">Cena Kursa (€):</label>
                    <input
                        className="form-input"
                        type="number"
                        step="0.01"
                        value={cena}
                        onChange={(e) => setCena(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Nazivi Sekcija:</label>
                    {sekcije.map((sekcija, index) => (
                        <div key={index} className="sekcija-input-grupa">
                            <input
                                className="form-input"
                                type="text"
                                placeholder={`Sekcija ${index + 1}`}
                                value={sekcija}
                                onChange={(e) => handleSekcijaChange(index, e)}
                            />
                            {/* Pokaži dugme za brisanje samo ako nije poslednje polje */}
                            {sekcije.length > 1 && index < sekcije.length - 1 && (
                                <button 
                                    type="button" 
                                    className="remove-sekcija-btn"
                                    onClick={() => handleRemoveSekcija(index)}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="form-group">
                    <label className="form-label">URL Naslovne Slike:</label>
                    <input
                        className="form-input"
                        type="url"
                        placeholder="https://primer.com/slika-kursa.jpg"
                        value={slika}
                        onChange={(e) => setSlika(e.target.value)}
                        required
                    />
                </div>
                
                <button className="form-submit-btn" type="submit">Dodaj Kurs</button>
            </form>
        </div>
    );
};

export default DodajKurs;