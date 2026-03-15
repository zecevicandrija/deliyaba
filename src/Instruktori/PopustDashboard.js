import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../login/api';
import './PopustDashboard.css';

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
        <div className="pd-page">
            <div className="pd-container">
                <button className="pd-back-btn" onClick={() => navigate('/instruktor')}>
                    <i className="ri-arrow-left-line"></i> Nazad
                </button>

                <div className="pd-header">
                    <div className="pd-header-icon">
                        <i className="ri-percent-line"></i>
                    </div>
                    <h1>Upravljanje Popustima</h1>
                    <p>Kreirajte, menjajte i brišite kodove za popust.</p>
                </div>

                {feedback.message && (
                    <div className={`pd-feedback ${feedback.type}`}>
                        {feedback.type === 'error' ? <i className="ri-error-warning-line"></i> : <i className="ri-check-line"></i>}
                        {feedback.message}
                    </div>
                )}

                <div className="pd-create-section">
                    <h3>Kreiraj Novi Popust</h3>
                    <form className="pd-create-form" onSubmit={handleCreateDiscount}>
                        <div className="pd-input-group">
                            <label>Kod Popusta</label>
                            <input
                                type="text"
                                placeholder="Npr. KOD20"
                                value={newDiscountCode}
                                onChange={e => setNewDiscountCode(e.target.value)}
                                required
                            />
                        </div>
                        <div className="pd-input-group">
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
                        <div className="pd-input-group">
                            <label>Datum Isteka</label>
                            <input
                                type="date"
                                value={newDiscountExpires}
                                onChange={e => setNewDiscountExpires(e.target.value)}
                            />
                        </div>
                        <div className="pd-input-group">
                            <label>Status</label>
                            <select 
                                value={newDiscountStatus}
                                onChange={e => setNewDiscountStatus(e.target.value)}
                                className="pd-select"
                            >
                                <option value="aktivan">Aktivan</option>
                                <option value="neaktivan">Neaktivan</option>
                            </select>
                        </div>
                        <button type="submit" className="pd-create-btn">
                            Kreiraj <i className="ri-add-line"></i>
                        </button>
                    </form>
                </div>

                <div className="pd-search-container">
                    <div className="pd-search-box">
                        <i className="ri-search-line pd-search-icon"></i>
                        <input
                            type="text"
                            placeholder="Pretraži kodove..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pd-search-input"
                        />
                    </div>
                </div>

                <div className="pd-table-responsive">
                    <table className="pd-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Kod Popusta</th>
                                <th>Procenat</th>
                                <th>Ističe</th>
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
                                    <td>{p.datum_isteka ? new Date(p.datum_isteka).toLocaleDateString('sr-RS') : 'Zauvek'}</td>
                                    <td>
                                        <span className={`pd-status-badge ${p.status === 'aktivan' ? 'aktivan' : 'neaktivan'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="pd-actions">
                                        <button className="pd-action-btn pd-edit-btn" onClick={() => openEditModal(p)} title="Izmeni popust">
                                            <i className="ri-edit-line"></i>
                                        </button>
                                        <button className="pd-action-btn pd-delete-btn" onClick={() => openDeleteModal(p)} title="Obriši popust">
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="pd-no-results">Nema pronađenih popusta.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && discountToEdit && (
                <div className="pd-modal-overlay">
                    <div className="pd-modal-content">
                        <button className="pd-close-btn" onClick={() => setIsEditModalOpen(false)}>&times;</button>
                        <h2>Izmeni Popust</h2>

                        <form onSubmit={handleEditSubmit} className="pd-form">
                            <div className="pd-field">
                                <label><i className="ri-percent-line"></i> Kod Popusta</label>
                                <input type="text" name="code" value={editForm.code} onChange={handleEditChange} required />
                            </div>
                            <div className="pd-field">
                                <label><i className="ri-price-tag-3-line"></i> Procenat (%)</label>
                                <input type="number" name="discountPercent" value={editForm.discountPercent} onChange={handleEditChange} required min="1" max="100" />
                            </div>
                            <div className="pd-field">
                                <label><i className="ri-calendar-event-line"></i> Datum Isteka</label>
                                <input type="date" name="datum_isteka" value={editForm.datum_isteka} onChange={handleEditChange} />
                            </div>
                            <div className="pd-field">
                                <label><i className="ri-toggle-line"></i> Status</label>
                                <select name="status" value={editForm.status} onChange={handleEditChange} className="pd-select">
                                    <option value="aktivan">Aktivan</option>
                                    <option value="neaktivan">Neaktivan</option>
                                </select>
                            </div>
                            <button type="submit" className="pd-submit-btn">
                                <i className="ri-save-line"></i> Sačuvaj Izmene
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && discountToDelete && (
                <div className="pd-modal-overlay">
                    <div className="pd-modal-content pd-delete-modal">
                        <div className="pd-warning-icon">
                            <i className="ri-alert-line"></i>
                        </div>
                        <h2>Potvrda Brisanja</h2>
                        <h3 className="pd-delete-name">{discountToDelete.kod} ({discountToDelete.procenat}%)</h3>

                        <div className="pd-warning-box">
                            <strong>Upozorenje:</strong> Brisanje popusta može biti onemogućeno ukoliko je ovaj kod već korišćen u starim transakcijama.
                        </div>

                        <div className="pd-modal-actions">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="pd-cancel-btn">Odustani</button>
                            <button onClick={confirmDelete} className="pd-confirm-delete-btn">
                                <i className="ri-delete-bin-line"></i> Obriši
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PopustDashboard;
