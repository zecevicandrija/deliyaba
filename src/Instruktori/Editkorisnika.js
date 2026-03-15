import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../login/api';
import './Editkorisnika.css';

const Editkorisnika = () => {
    const navigate = useNavigate();
    const [sviKorisnici, setSviKorisnici] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit modal states
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [editUserForm, setEditUserForm] = useState({ email: '', sifra: '', pretplata: '' });
    const [editFeedback, setEditFeedback] = useState({ type: '', message: '' });

    // Delete modal states
    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteFeedback, setDeleteFeedback] = useState({ type: '', message: '' });

    const fetchKorisnici = async () => {
        try {
            const response = await api.get('/api/korisnici');
            setSviKorisnici(response.data);
        } catch (error) {
            console.error('Greška pri dohvatanju korisnika:', error);
        }
    };

    useEffect(() => {
        fetchKorisnici();
    }, []);

    // Filter by email
    const filteredKorisnici = sviKorisnici.filter(k =>
        k.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Edit Logic ---
    const openEditUserModal = (k) => {
        setUserToEdit(k);
        let pt = '';
        if (k.subscription_expires_at) {
            try {
                // Pretvori u YYYY-MM-DD format za input type="date"
                pt = new Date(k.subscription_expires_at.replace(' ', 'T')).toISOString().split('T')[0];
            } catch (e) {}
        }
        setEditUserForm({ email: k.email, sifra: '', pretplata: pt });
        setEditFeedback({ type: '', message: '' });
        setIsEditUserModalOpen(true);
    };

    const handleEditUserChange = (e) => setEditUserForm({ ...editUserForm, [e.target.name]: e.target.value });

    const handleEditUserSubmit = async (e) => {
        e.preventDefault();
        setEditFeedback({ type: '', message: '' });

        try {
            const body = {};
            if (editUserForm.email !== userToEdit.email) body.email = editUserForm.email;
            if (editUserForm.sifra) body.sifra = editUserForm.sifra;

            let currentPt = '';
            if (userToEdit.subscription_expires_at) {
                try {
                    currentPt = new Date(userToEdit.subscription_expires_at.replace(' ', 'T')).toISOString().split('T')[0];
                } catch(e) {}
            }

            if (editUserForm.pretplata !== currentPt) {
                body.subscription_expires_at = editUserForm.pretplata ? `${editUserForm.pretplata} 23:59:59` : null;
                // Ako pretplata ističe stavimo status na expired, ako se stavi nova, na active (opciono)
                // Ako se stavlja NULL onda se verovatno otkazuje
                if (editUserForm.pretplata) body.subscription_status = 'active';
            }

            if (Object.keys(body).length > 0) {
                await api.put(`/api/korisnici/${userToEdit.id}`, body);
                await fetchKorisnici();
            }
            setIsEditUserModalOpen(false);
            setUserToEdit(null);
        } catch (error) {
            console.error('Greška pri ažuriranju korisnika:', error);
            const msg = error.response?.data?.message || error.response?.data?.error || 'Greška pri ažuriranju korisnika';
            setEditFeedback({ type: 'error', message: msg });
        }
    };

    // --- Delete Logic ---
    const openDeleteUserModal = (k) => {
        setUserToDelete(k);
        setDeleteFeedback({ type: '', message: '' });
        setIsDeleteUserModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        setDeleteFeedback({ type: '', message: '' });
        try {
            await api.delete(`/api/korisnici/${userToDelete.id}`);
            await fetchKorisnici();
            setIsDeleteUserModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error('Greška pri brisanju korisnika:', error);
            const msg = error.response?.data?.message || 'Greška pri brisanju korisnika';
            setDeleteFeedback({ type: 'error', message: msg });
        }
    };

    return (
        <div className="ek-page">
            <div className="ek-container">
                <button className="ek-back-btn" onClick={() => navigate('/instruktor')}>
                    <i className="ri-arrow-left-line"></i> Nazad
                </button>

                <div className="ek-header">
                    <div className="ek-header-icon">
                        <i className="ri-group-line"></i>
                    </div>
                    <h1>Upravljaj Korisnicima</h1>
                    <p>Pregledajte sve korisnike, menjajte njihove podatke i brišite naloge.</p>
                </div>

                {/* Search Bar */}
                <div className="ek-search-container">
                    <div className="ek-search-box">
                        <i className="ri-search-line ek-search-icon"></i>
                        <input
                            type="text"
                            placeholder="Pretraži po email adresi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="ek-search-input"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="ek-table-responsive">
                    <table className="ek-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ime i Prezime</th>
                                <th>Email</th>
                                <th>Uloga</th>
                                <th>Pretplata Do</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredKorisnici.length > 0 ? filteredKorisnici.map(k => (
                                <tr key={k.id}>
                                    <td>{k.id}</td>
                                    <td>{k.ime} {k.prezime}</td>
                                    <td>{k.email}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{k.uloga}</td>
                                    <td>{k.subscription_expires_at ? new Date(k.subscription_expires_at.replace(' ', 'T')).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <span className={`ek-status-badge ${k.subscription_status === 'active' ? 'active' : 'inactive'}`}>
                                            {k.subscription_status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="ek-actions">
                                        <button className="ek-action-btn ek-edit-btn" onClick={() => openEditUserModal(k)} title="Izmeni mejl/šifru">
                                            <i className="ri-edit-line"></i>
                                        </button>
                                        <button className="ek-action-btn ek-delete-btn" onClick={() => openDeleteUserModal(k)} title="Obriši korisnika">
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="ek-no-results">Nema pronađenih korisnika.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {isEditUserModalOpen && userToEdit && (
                <div className="ek-modal-overlay">
                    <div className="ek-modal-content">
                        <button className="ek-close-btn" onClick={() => setIsEditUserModalOpen(false)}>&times;</button>
                        <h2>Izmeni Korisnika</h2>
                        <div className="ek-modal-header-info">
                            <div className="ek-avatar"><i className="ri-user-smile-line"></i></div>
                            <div>
                                <h3>{userToEdit.ime} {userToEdit.prezime}</h3>
                                <span>{userToEdit.email}</span>
                            </div>
                        </div>

                        {editFeedback.message && (
                            <div className={`ek-feedback ${editFeedback.type}`}>
                                <i className="ri-error-warning-line"></i> {editFeedback.message}
                            </div>
                        )}

                        <form onSubmit={handleEditUserSubmit} className="ek-form">
                            <div className="ek-field">
                                <label htmlFor="email"><i className="ri-mail-line"></i> Email</label>
                                <input type="email" name="email" id="email" value={editUserForm.email} onChange={handleEditUserChange} required />
                            </div>
                            <div className="ek-field">
                                <label htmlFor="sifra"><i className="ri-lock-password-line"></i> Nova Šifra (opciono)</label>
                                <input type="password" name="sifra" id="sifra" value={editUserForm.sifra} onChange={handleEditUserChange} placeholder="Unesite novu šifru" />
                            </div>
                            <div className="ek-field">
                                <label htmlFor="pretplata"><i className="ri-calendar-line"></i> Pretplata Do</label>
                                <input type="date" name="pretplata" id="pretplata" value={editUserForm.pretplata} onChange={handleEditUserChange} />
                            </div>
                            <button type="submit" className="ek-submit-btn">
                                <i className="ri-save-line"></i> Sačuvaj Izmene
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Confirm Modal */}
            {isDeleteUserModalOpen && userToDelete && (
                <div className="ek-modal-overlay">
                    <div className="ek-modal-content ek-delete-modal">
                        <div className="ek-warning-icon">
                            <i className="ri-alert-line"></i>
                        </div>
                        <h2>Potvrda Brisanja</h2>
                        <p>Da li ste sigurni da želite trajno da obrišete korisnika:</p>
                        <h3 className="ek-delete-name">{userToDelete.ime} {userToDelete.prezime}</h3>

                        <div className="ek-warning-box">
                            <strong>Upozorenje:</strong> Brisanjem korisnika nepovratno gubite i sve njegove podatke o transakcijama, pretplatama i kupovinama!
                        </div>

                        {deleteFeedback.message && (
                            <div className={`ek-feedback ${deleteFeedback.type}`}>
                                <i className="ri-error-warning-line"></i> {deleteFeedback.message}
                            </div>
                        )}

                        <div className="ek-modal-actions">
                            <button onClick={() => setIsDeleteUserModalOpen(false)} className="ek-cancel-btn">Odustani</button>
                            <button onClick={confirmDeleteUser} className="ek-confirm-delete-btn">
                                <i className="ri-delete-bin-line"></i> Obriši Korisnika
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editkorisnika;
