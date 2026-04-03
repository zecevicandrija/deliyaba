import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../login/api';
import styles from './Editkorisnika.module.css';

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
        <div className={styles.page}>
            <div className={styles.watermark}>Deliya</div>

            <div className={styles.container}>
                <button className={styles.backBtn} onClick={() => navigate('/instruktor')}>
                    <i className="ri-arrow-left-line"></i> Nazad na Tablu
                </button>

                <header className={styles.header}>
                    <div className={styles.badge}>
                        <span className={styles.editorialLine}></span>
                        <span>Administrativni Kontroler</span>
                    </div>
                    <h1 className={styles.title}>Upravljaj Korisnicima</h1>
                    <p className={styles.subtitle}>Sistemski pregled baze podataka polaznika, statusa pretplata i pristupnih nivoa.</p>
                </header>

                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <div className={styles.searchBox}>
                        <i className={`ri-search-line ${styles.searchIcon}`}></i>
                        <input
                            type="text"
                            placeholder="Pretraži protokol po email adresi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Polaznik</th>
                                <th>Email Adresa</th>
                                <th>Nivo</th>
                                <th>Pretplata</th>
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
                                        <span className={`${styles.statusBadge} ${k.subscription_status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                            {k.subscription_status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => openEditUserModal(k)} title="Izmeni mejl/šifru">
                                            <i className="ri-edit-line"></i>
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => openDeleteUserModal(k)} title="Obriši korisnika">
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className={styles.noResults}>Nema pronađenih korisnika u bazi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {isEditUserModalOpen && userToEdit && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeBtn} onClick={() => setIsEditUserModalOpen(false)}>&times;</button>
                        <h2 className={styles.modalTitle}>Izmeni Korisnika</h2>
                        
                        <div className={styles.modalHeaderInfo}>
                            <div className={styles.avatar}><i className="ri-user-smile-line"></i></div>
                            <div>
                                <h3>{userToEdit.ime} {userToEdit.prezime}</h3>
                                <span>Primarni: {userToEdit.email}</span>
                            </div>
                        </div>

                        {editFeedback.message && (
                            <div className={`${styles.feedback} ${styles.error}`}>
                                <i className="ri-error-warning-line"></i> {editFeedback.message}
                            </div>
                        )}

                        <form onSubmit={handleEditUserSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <label htmlFor="email"><i className="ri-mail-line"></i> Protokol Email</label>
                                <input type="email" name="email" id="email" value={editUserForm.email} onChange={handleEditUserChange} required />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="sifra"><i className="ri-lock-password-line"></i> Nova Pristupna Šifra</label>
                                <input type="password" name="sifra" id="sifra" value={editUserForm.sifra} onChange={handleEditUserChange} placeholder="Unesite novu lozinku (opcionalno)" />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="pretplata"><i className="ri-calendar-line"></i> Validnost Pretplate</label>
                                <input type="date" name="pretplata" id="pretplata" value={editUserForm.pretplata} onChange={handleEditUserChange} />
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                <i className="ri-save-line"></i> Autorizuj Izmene
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Confirm Modal */}
            {isDeleteUserModalOpen && userToDelete && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeBtn} onClick={() => setIsDeleteUserModalOpen(false)}>&times;</button>
                        <div className={styles.deleteModal}>
                            <div className={styles.warningIcon}>
                                <i className="ri-alert-line"></i>
                            </div>
                            <h2 className={styles.modalTitle}>Potvrda Brisanja</h2>
                            <p>Da li ste sigurni da želite trajno da uklonite polaznika:</p>
                            <h3 style={{ textTransform: 'uppercase', color: '#111827', margin: '1rem 0' }}>{userToDelete.ime} {userToDelete.prezime}</h3>

                            <div className={styles.warningBox}>
                                <strong>Upozorenje:</strong> Brisanje korisnika nepovratno gubite sve transakcije, kupovine i evidenciju napretka u sistemu.
                            </div>

                            {deleteFeedback.message && (
                                <div className={`${styles.feedback} ${styles.error}`}>
                                    <i className="ri-error-warning-line"></i> {deleteFeedback.message}
                                </div>
                            )}

                            <div className={styles.modalActions}>
                                <button onClick={() => setIsDeleteUserModalOpen(false)} className={styles.cancelBtn}>Prekini</button>
                                <button onClick={confirmDeleteUser} className={styles.confirmDeleteBtn}>
                                    <i className="ri-delete-bin-line"></i> Finalizuj Brisanje
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editkorisnika;
