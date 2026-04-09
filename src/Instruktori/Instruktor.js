import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../login/auth';
import { useNavigate } from 'react-router-dom';
import api from '../login/api';
import styles from './Instruktor.module.css';

const Instruktor = () => {
    const [kursevi, setKursevi] = useState([]);
    const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editingCourse, setEditingCourse] = useState(null);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const [editCourseForm, setEditCourseForm] = useState({ naziv: '', opis: '', cena: '', slika: '' });
    const [courseImageFile, setCourseImageFile] = useState(null);

    const { user } = useAuth();
    const instructorId = user ? user.id : null;
    const navigate = useNavigate();

    const fetchKursevi = useCallback(async () => {
        if (user) {
            try {
                const endpoint = user.uloga === 'admin'
                    ? '/api/kursevi'
                    : `/api/kursevi/instruktor/${instructorId}`;

                const response = await api.get(endpoint);
                setKursevi(response.data);
            } catch (error) {
                console.error('Greška pri dohvatanju kurseva:', error);
            }
        }
    }, [user, instructorId]);

    useEffect(() => {
        fetchKursevi();
    }, [fetchKursevi]);

    // --- Logika za Izmenu Kursa ---
    const openEditCourseModal = (course) => {
        setEditingCourse(course);
        setEditCourseForm({ naziv: course.naziv, opis: course.opis, cena: course.cena, slika: course.slika || '' });
        setCourseImageFile(null); // Resetuj fajl
        setIsEditCourseModalOpen(true);
    };

    const handleEditCourseChange = (e) => setEditCourseForm({ ...editCourseForm, [e.target.name]: e.target.value });
    const handleCourseImageChange = (e) => setCourseImageFile(e.target.files[0]);

    const handleEditCourseSubmit = async (e) => {
        e.preventDefault();
        if (!editingCourse) return;

        const originalInstructorId = user.uloga === 'admin' ? editingCourse.instruktor_id : instructorId;

        const payload = {
            naziv: editCourseForm.naziv,
            opis: editCourseForm.opis
        };

        const parsedCena = parseFloat(editCourseForm.cena);
        if (!isNaN(parsedCena)) {
            payload.cena = parsedCena;
        }

        const parsedInstrId = parseInt(originalInstructorId, 10);
        if (!isNaN(parsedInstrId)) {
            payload.instruktor_id = parsedInstrId;
        }

        if (editCourseForm.slika && editCourseForm.slika.trim() !== '') {
            payload.slika = editCourseForm.slika;
        }

        try {
            await api.put(`/api/kursevi/${editingCourse.id}`, payload);
            await fetchKursevi();
            setIsEditCourseModalOpen(false);
        } catch (error) {
            console.error('Greška pri ažuriranju kursa:', error);
            if (error.response && error.response.data) {
                console.error('Detalji greške (backend):', error.response.data);
                const errorMsg = error.response.data.detalji
                    ? JSON.stringify(error.response.data.detalji, null, 2)
                    : error.response.data.error;
                alert('Greška pri izmeni:\n' + errorMsg);
            } else {
                alert('Greška pri izmeni. Proveri konzolu za detalje.');
            }
        }
    };

    // --- Logika za Brisanje Kursa ---
    const openDeleteModal = (course) => {
        setCourseToDelete(course);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return;

        try {
            await api.delete(`/api/kursevi/${courseToDelete.id}`);
            setKursevi(kursevi.filter(kurs => kurs.id !== courseToDelete.id));
        } catch (error) {
            console.error('Greška pri brisanju kursa:', error);
        } finally {
            setIsDeleteModalOpen(false);
            setCourseToDelete(null);
        }
    };

    // --- Navigacija ---
    const viewStudents = (kursId) => navigate(`/studenti/${kursId}`);
    const viewLessons = (courseId) => navigate(`/edit-kurs/${courseId}`);
    const viewStatistics = (kursId) => navigate(`/statistika/${kursId}`);


    return (
        <div className={styles.dashboard}>
            <div className={styles.watermark}>Deliya</div>

            <header className={styles.header}>
                <div className={styles.badge}>
                    <span className={styles.editorialLine}></span>
                    <span>Instruktorska Tabla</span>
                </div>
                <h1 className={styles.title}>Dobrodošli, {user?.ime}!</h1>
                <p className={styles.subtitle}>Upravljajte svojim kursevima i pratite zaradu kroz centralizovanu administrativnu platformu.</p>

                <div className={styles.actionButtons}>
                    <button className={styles.primaryBtn} onClick={() => navigate('/zarada')}>
                        <i className="ri-bar-chart-line"></i> Statistika
                    </button>
                    <button className={styles.primaryBtn} onClick={() => navigate('/dodajkorisnika')}>
                        <i className="ri-user-add-line"></i> Dodaj Korisnika
                    </button>
                    {user?.uloga === 'admin' && (
                        <>
                            <button className={styles.secondaryBtn} onClick={() => navigate('/edit-korisnika')}>
                                <i className="ri-group-line"></i> Upravljaj Korisnicima
                            </button>
                            <button className={styles.secondaryBtn} onClick={() => navigate('/popusti')} style={{ backgroundColor: '#0047AB' }}>
                                <i className="ri-percent-line"></i> Upravljaj Popustima
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className={styles.mainContent}>
                <div className={styles.kurseviSection}>
                    <h2 className={styles.sectionTitle}>Moji Kursevi</h2>
                    <div className={styles.kursGrid}>
                        {kursevi.length > 0 ? kursevi.map(kurs => (
                            <div className={styles.kursCard} key={kurs.id}>
                                <div className={styles.imageWrapper}>
                                    <img src={kurs.slika} alt={kurs.naziv} className={styles.kursImage} />
                                </div>
                                <div className={styles.kursDetails}>
                                    <h3>{kurs.naziv}</h3>
                                    <p className={styles.kursPrice}>{kurs.cena} €</p>
                                </div>
                                <div className={styles.kursActions}>
                                    <button className={styles.actionBtn} onClick={() => openEditCourseModal(kurs)} title="Izmeni Kurs"><i className="ri-edit-line"></i></button>
                                    <button className={styles.actionBtn} onClick={() => viewLessons(kurs.id)} title="Uredi Lekcije"><i className="ri-list-check"></i></button>
                                    {/* <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => openDeleteModal(kurs)} title="Obriši Kurs"><i className="ri-delete-bin-line"></i></button> */}
                                </div>
                            </div>
                        )) : <p>Trenutno nemate kreiranih kurseva.</p>}
                    </div>
                </div>
            </div>


            {/* Edit Course Modal */}
            {isEditCourseModalOpen && editingCourse && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeBtn} onClick={() => setIsEditCourseModalOpen(false)}>&times;</button>
                        <h2 className={styles.modalTitle}>Izmeni Kurs</h2>
                        <form onSubmit={handleEditCourseSubmit} className={styles.modalForm}>
                            <label>Naziv: <input type="text" name="naziv" value={editCourseForm.naziv} onChange={handleEditCourseChange} required /></label>
                            <label>Opis: <textarea name="opis" value={editCourseForm.opis} onChange={handleEditCourseChange} required></textarea></label>
                            <label>Cena: <input type="number" name="cena" value={editCourseForm.cena} onChange={handleEditCourseChange} required /></label>
                            <label>Slika (URL): <input type="text" name="slika" value={editCourseForm.slika} onChange={handleEditCourseChange} /></label>
                            <button type="submit" className={styles.saveBtn}>Sačuvaj Izmene</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && courseToDelete && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Potvrda Brisanja</h2>
                        <p>Da li ste sigurni da želite trajno da obrišete kurs: <strong>{courseToDelete.naziv}</strong>?</p>
                        <div className={styles.modalActions}>
                            <button onClick={() => setIsDeleteModalOpen(false)} className={styles.cancelBtn}>Odustani</button>
                            <button onClick={confirmDeleteCourse} className={styles.confirmBtn}>Obriši</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Instruktor;
