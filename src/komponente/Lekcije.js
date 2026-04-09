import React, { useEffect, useState } from 'react';
import * as tus from 'tus-js-client';
import api from '../login/api';
import { useAuth } from '../login/auth';
import styles from './Lekcije.module.css';

const Lekcije = () => {
    const [lekcije, setLekcije] = useState([]);
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);

    const [newLekcija, setNewLekcija] = useState({
        course_id: '',
        title: '',
        content: '',
        sekcija_id: ''
    });

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user || !user.id) return;
            try {
                const endpoint = user.uloga === 'admin'
                    ? '/api/kursevi'
                    : `/api/kursevi/instruktor/${user.id}`;

                const response = await api.get(endpoint);
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, [user]);

    const fetchSections = async (courseId) => {
        if (!courseId) {
            setSections([]);
            return;
        }
        try {
            const response = await api.get(`/api/lekcije/sections/${courseId}`);
            setSections(response.data);
        } catch (error) {
            console.error('Error fetching sections:', error);
            setSections([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLekcija({ ...newLekcija, [name]: value });

        if (name === 'course_id') {
            setNewLekcija(prev => ({ ...prev, course_id: value, sekcija_id: '' }));
            fetchSections(value);
        }
    };

    const handleVideoChange = (e) => {
        setVideo(e.target.files[0]);
    };

    // Funkcija za direktan upload na Bunny putem TUS protokola
    const uploadVideoDirectly = (file, credentials) => {
        return new Promise((resolve, reject) => {
            const upload = new tus.Upload(file, {
                endpoint: 'https://video.bunnycdn.com/tusupload',
                retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
                headers: {
                    AuthorizationSignature: credentials.authorizationSignature,
                    AuthorizationExpire: credentials.authorizationExpire,
                    VideoId: credentials.videoId,
                    LibraryId: credentials.libraryId,
                },
                metadata: {
                    filetype: file.type,
                    title: newLekcija.title,
                },
                onError: (error) => {
                    console.error('TUS upload error:', error);
                    reject(error);
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
                    setUploadProgress(percentage);
                    setUploadStatus(`Uploading: ${percentage}%`);
                },
                onSuccess: () => {
                    setUploadStatus('Video uspešno uploadovan!');
                    resolve(credentials.videoId);
                }
            });

            upload.start();
        });
    };

    const handleAddLekcija = async (e) => {
        e.preventDefault();

        // Validacija
        if (!newLekcija.course_id || !newLekcija.sekcija_id || !newLekcija.title || !newLekcija.content || !video) {
            alert('Sva polja i video su obavezni, uključujući i odabir sekcije.');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            setUploadStatus('Priprema uploada...');
            const credentialsResponse = await api.post('/api/lekcije/prepare-upload', {
                title: newLekcija.title
            });
            const credentials = credentialsResponse.data;

            setUploadStatus('Uploadujem video...');
            const videoGuid = await uploadVideoDirectly(video, credentials);

            setUploadStatus('Čuvanje lekcije...');
            await api.post('/api/lekcije', {
                course_id: newLekcija.course_id,
                title: newLekcija.title,
                content: newLekcija.content,
                sekcija_id: newLekcija.sekcija_id,
                video_guid: videoGuid
            });

            alert('Lekcija uspešno dodata!');

            // Resetovanje forme
            setNewLekcija({ course_id: '', title: '', content: '', sekcija_id: '' });
            setVideo(null);
            setSections([]);
            setUploadProgress(0);
            setUploadStatus('');

            const fileInput = document.getElementById('video');
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error('Error adding lesson:', error);
            alert(`Greška pri dodavanju lekcije: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.badge}>Lesson Creator</span>
                    <h1 className={styles.title}>Napravite Lekciju</h1>
                </div>

                <form onSubmit={handleAddLekcija} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="course_id">Izaberite kurs</label>
                        <select
                            id="course_id"
                            name="course_id"
                            value={newLekcija.course_id}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">-- Odaberite kurs na kom želite dodati lekciju --</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.naziv}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="sekcija_id">Sekcija</label>
                        <select
                            id="sekcija_id"
                            name="sekcija_id"
                            value={newLekcija.sekcija_id}
                            onChange={handleInputChange}
                            required
                            disabled={!newLekcija.course_id || sections.length === 0}
                        >
                            <option value="">-- Odaberite sekciju --</option>
                            {sections.map((sekcija) => (
                                <option key={sekcija.id} value={sekcija.id}>
                                    {sekcija.naziv}
                                </option>
                            ))}
                        </select>
                        {newLekcija.course_id && sections.length === 0 && (
                            <small>Ovaj kurs nema definisane sekcije. Morate ih prvo dodati u uređivanju kursa.</small>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="title">Naslov lekcije</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={newLekcija.title}
                            onChange={handleInputChange}
                            required
                            placeholder="npr. Lekcija 01 - Uvod u kurs"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="content">Sadržaj (Opis)</label>
                        <textarea
                            id="content"
                            name="content"
                            value={newLekcija.content}
                            onChange={handleInputChange}
                            required
                            placeholder="Unesite kratak opis ili sadržaj lekcije..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="video">Video fajl</label>
                        <div className={styles.fileInputWrapper}>
                            <input
                                type="file"
                                id="video"
                                name="video"
                                accept="video/*"
                                onChange={handleVideoChange}
                                required
                                className={styles.fileInput}
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className={styles.statusText}>{uploadStatus}</p>
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Slanje na server...' : 'Objavi Lekciju'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Lekcije;