import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../login/api';
import styles from './PopustDashboard.module.css';

const PopustDashboard = () => {
    const navigate = useNavigate();
    const [popusti, setPopusti] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Kreiranje
    const [newDiscountCode, setNewDiscountCode] = useState('');
    const [newDiscountPercent, setNewDiscountPercent] = useState('');
    const [newDiscountExpires, setNewDiscountExpires] = useState('');
    const [newDiscountStatus, setNewDiscountStatus] = useState('aktivan');

    // Edit modali
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [discountToEdit, setDiscountToEdit] = useState(null);
    const [editForm, setEditForm] = useState({ code: '', discountPercent: '', datum_isteka: '', status: 'aktivan' });

    // Delete modali
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState(null);

    // Feedback
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const fetchPopusti = async () => {
        try {
            const response = await api.get('/api/popusti');
            setPopusti(response.data);
        } catch (error) {
            console.error('Greška pri dohvatanju popusta:', error);
            showFeedback('error', 'Greška pri učitavanju popusta.');
        }
    };

    useEffect(() => {
        fetchPopusti();
    }, []);

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
    };

    // --- Kreiranje ---
    const handleCreateDiscount = async (e) => {
        e.preventDefault();
        setFeedback({ type: '', message: '' });

        if (!newDiscountCode || !newDiscountPercent) {
            showFeedback('error', 'Sva polja su obavezna.');
            return;
        }

        try {
            await api.post('/api/popusti/create', {
                code: newDiscountCode,
                discountPercent: Number(newDiscountPercent),
                datum_isteka: newDiscountExpires || null,
                status: newDiscountStatus
            });
            showFeedback('success', 'Kod je uspešno kreiran!');
            setNewDiscountCode('');
            setNewDiscountPercent('');
            setNewDiscountExpires('');
            setNewDiscountStatus('aktivan');
            fetchPopusti();
        } catch (error) {
            const msg = error.response?.data?.message || 'Greška prilikom kreiranja koda.';
            showFeedback('error', msg);
        }
    };

    // --- Edit ---
    const openEditModal = (p) => {
        setDiscountToEdit(p);
        setEditForm({ 
            code: p.kod, 
            discountPercent: p.procenat,
            datum_isteka: p.datum_isteka ? p.datum_isteka.split('T')[0] : '',
            status: p.status || 'aktivan'
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = {};
            if (editForm.code !== discountToEdit.kod) body.code = editForm.code;
            if (Number(editForm.discountPercent) !== discountToEdit.procenat) body.discountPercent = Number(editForm.discountPercent);
            
            const dbDate = discountToEdit.datum_isteka ? discountToEdit.datum_isteka.split('T')[0] : '';
            if (editForm.datum_isteka !== dbDate) body.datum_isteka = editForm.datum_isteka || null;
            if (editForm.status !== discountToEdit.status) body.status = editForm.status;

            if (Object.keys(body).length > 0) {
                await api.put(`/api/popusti/${discountToEdit.id}`, body);
                showFeedback('success', 'Popust izmenjen.');
                fetchPopusti();
            }
            setIsEditModalOpen(false);
            setDiscountToEdit(null);
        } catch (error) {
            const msg = error.response?.data?.message || 'Greška pri ažuriranju popusta.';
            showFeedback('error', msg);
        }
    };

    // --- Brisanje ---
    const openDeleteModal = (p) => {
        setDiscountToDelete(p);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/api/popusti/${discountToDelete.id}`);
            showFeedback('success', 'Popust obrisan.');
            fetchPopusti();
            setIsDeleteModalOpen(false);
            setDiscountToDelete(null);
        } catch (error) {
            const msg = error.response?.data?.message || 'Greška pri brisanju popusta.';
            setIsDeleteModalOpen(false);
            setDiscountToDelete(null);
            showFeedback('error', msg);
        }
    };

    const filteredPopusti = popusti.filter(p => p.kod.toLowerCase().includes(searchQuery.toLowerCase()));

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
                        <span>Promotivni Sistem</span>
                    </div>
                    <h1 className={styles.title}>Upravljaj Popustima</h1>
                    <p className={styles.subtitle}>Konfiguracija promotivnih kodova, procentualnih umanjenja i rokova važenja.</p>
                </header>

                {feedback.message && (
                    <div className={`${styles.feedback} ${styles[feedback.type]}`}>
                        <i className={feedback.type === 'error' ? 'ri-error-warning-line' : 'ri-check-line'}></i>
                        {feedback.message}
                    </div>
                )}

                <div className={styles.createSection}>
                    <h3 className={styles.sectionTitle}>Kreiraj Novi Popust</h3>
                    <form className={styles.createForm} onSubmit={handleCreateDiscount}>
                        <div className={styles.field}>
                            <label>Kod Popusta</label>
                            <input
                                type="text"
                                placeholder="Npr. MASTER10"
                                value={newDiscountCode}
                                onChange={e => setNewDiscountCode(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Procenat (%)</label>
                            <input
                                type="number"
                                placeholder="Unesite popust"
                                value={newDiscountPercent}
                                onChange={e => setNewDiscountPercent(e.target.value)}
                                min="1" max="100"
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Datum Isteka</label>
                            <input
                                type="date"
                                value={newDiscountExpires}
                                onChange={e => setNewDiscountExpires(e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Status</label>
                            <select 
                                value={newDiscountStatus}
                                onChange={e => setNewDiscountStatus(e.target.value)}
                                className={styles.select}
                            >
                                <option value="aktivan">Aktivan</option>
                                <option value="neaktivan">Neaktivan</option>
                            </select>
                        </div>
                        <button type="submit" className={styles.createBtn}>
                            Dodaj Kod <i className="ri-add-line"></i>
                        </button>
                    </form>
                </div>

                <div className={styles.searchContainer}>
                    <div className={styles.searchBox}>
                        <i className={`ri-search-line ${styles.searchIcon}`}></i>
                        <input
                            type="text"
                            placeholder="Pretraži aktivne kodove..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Kod Popusta</th>
                                <th>Umanjenje</th>
                                <th>Validnost</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPopusti.length > 0 ? filteredPopusti.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td><strong>{p.kod}</strong></td>
                                    <td>{p.procenat}%</td>
                                    <td>{p.datum_isteka ? new Date(p.datum_isteka).toLocaleDateString('sr-RS') : 'Trajno'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${p.status === 'aktivan' ? styles.statusActive : styles.statusInactive}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => openEditModal(p)} title="Izmeni popust">
                                            <i className="ri-edit-line"></i>
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => openDeleteModal(p)} title="Obriši popust">
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className={styles.noResults}>Nema pronađenih popusta u sistemu.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && discountToEdit && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}>&times;</button>
                        <h2 className={styles.modalTitle}>Izmeni Popust</h2>

                        <form onSubmit={handleEditSubmit} className={styles.modalForm}>
                            <div className={styles.modalField}>
                                <label><i className="ri-percent-line"></i> Kod Popusta</label>
                                <input type="text" name="code" value={editForm.code} onChange={handleEditChange} required />
                            </div>
                            <div className={styles.modalField}>
                                <label><i className="ri-price-tag-3-line"></i> Procenat (%)</label>
                                <input type="number" name="discountPercent" value={editForm.discountPercent} onChange={handleEditChange} required min="1" max="100" />
                            </div>
                            <div className={styles.modalField}>
                                <label><i className="ri-calendar-event-line"></i> Datum Isteka</label>
                                <input type="date" name="datum_isteka" value={editForm.datum_isteka} onChange={handleEditChange} />
                            </div>
                            <div className={styles.modalField}>
                                <label><i className="ri-toggle-line"></i> Status</label>
                                <select name="status" value={editForm.status} onChange={handleEditChange}>
                                    <option value="aktivan">Aktivan</option>
                                    <option value="neaktivan">Neaktivan</option>
                                </select>
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                <i className="ri-save-line"></i> Autorizuj Izmene
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && discountToDelete && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeBtn} onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
                        <div className={styles.deleteModal}>
                            <div className={styles.warningIcon}>
                                <i className="ri-alert-line"></i>
                            </div>
                            <h2 className={styles.modalTitle}>Potvrda Brisanja</h2>
                            <h3 style={{ textTransform: 'uppercase', color: '#111827', margin: '1rem 0' }}>{discountToDelete.kod} ({discountToDelete.procenat}%)</h3>

                            <div className={styles.warningBox}>
                                <strong>Upozorenje:</strong> Brisanje popusta može biti onemogućeno ukoliko je ovaj kod sistemski povezan sa transakcijama.
                            </div>

                            <div className={styles.modalActions}>
                                <button onClick={() => setIsDeleteModalOpen(false)} className={styles.cancelBtn}>Prekini</button>
                                <button onClick={confirmDelete} className={styles.confirmDeleteBtn}>
                                    <i className="ri-delete-bin-line"></i> Obriši Kod
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PopustDashboard;
