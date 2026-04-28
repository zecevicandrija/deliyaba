// src/components/KursDetalj.js
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../login/api.js';
import { useAuth } from '../login/auth.js';
import styles from './KursDetalj.module.css';
import Komentari from '../Instruktori/Komentari.js';
import Editor from '@monaco-editor/react';
import Hls from 'hls.js';
import { RiPlayCircleLine, RiFileTextLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

if (typeof window !== "undefined" && !window.Hls) {
    window.Hls = Hls;
}

// Preporuka: Zamenite klase sa Remix Icon klasama radi konzistentnosti
const PlayIcon = () => <RiPlayCircleLine />;
const AssignmentIcon = () => <RiFileTextLine />;


const KursDetalj = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [kurs, setKurs] = useState(null);
    const [lekcije, setLekcije] = useState([]);
    const [sekcije, setSekcije] = useState([]);
    const [otvorenaLekcija, setOtvorenaLekcija] = useState(null);

    const [kupioKurs, setKupioKurs] = useState(false);
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [completedLessonsLoaded, setCompletedLessonsLoaded] = useState(false);
    const [code, setCode] = useState('// Unesite svoj kod ovde');
    const [language, setLanguage] = useState('javascript');
    const [showEditor, setShowEditor] = useState(false);
    const [savedCodes, setSavedCodes] = useState({});
    const [reviewFeedback, setReviewFeedback] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [currentStreamUrl, setCurrentStreamUrl] = useState('');
    const [searchParams] = useSearchParams();

    // Provera pretplate: pristup ima ako datum nije istekao I status NIJE 'expired' ili 'payment_failed'
    // Status 'cancelled' dozvolja pristup do datuma isteka
    const imaAktivnuPretplatu = user &&
        user.subscription_expires_at &&
        new Date(user.subscription_expires_at) > new Date() &&
        user.subscription_status !== 'expired' &&
        user.subscription_status !== 'payment_failed';

    // Moved up to be available for hooks
    const isCourseAccessible = kurs ? (kupioKurs && (!kurs.is_subscription || imaAktivnuPretplatu)) : false;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kursResponse, lekcijeResponse, sekcijeResponse] = await Promise.all([
                    api.get(`/api/kursevi/${id}`),
                    api.get(`/api/lekcije/course/${id}`),
                    api.get(`/api/lekcije/sections/${id}`)
                ]);

                setKurs(kursResponse.data);
                setLekcije(lekcijeResponse.data);
                setSekcije(sekcijeResponse.data);

                // === NOVA, POBOLJŠANA LOGIKA ===
                const sekcijaIdFromUrl = searchParams.get('sekcija'); // Čitamo ID iz "?sekcija=..."

                if (sekcijaIdFromUrl) {
                    // Ako postoji ID u URL-u, otvaramo tu sekciju
                    const secId = parseInt(sekcijaIdFromUrl, 10);
                    setActiveSection(secId);

                    // NAPOMENA: Otvaranje lekcije se sada dešava u zasebnom useEffect-u
                    // koji prati status učitanih lekcija i completedLessons
                } else if (sekcijeResponse.data.length > 0) {
                    // Ako ne postoji, otvaramo prvu sekciju kao i do sada
                    setActiveSection(sekcijeResponse.data[0].id);
                }

                if (user) {
                    // OPTIMIZOVANO: Svi user-specifični pozivi idu PARALELNO umesto sekvencijalno
                    const [
                        _subscriptionRes,
                        kupovinaResponse,
                        completedResponse
                    ] = await Promise.allSettled([
                        api.get('/api/subscription/status').catch(() => null),
                        api.get(`/api/kupovina/user/${user.id}`),
                        api.get(`/api/kompletirane_lekcije/user/${user.id}/course/${id}`)
                    ]);

                    // Obradi rezultate — allSettled ne baca grešku ako jedan fail-uje
                    if (kupovinaResponse.status === 'fulfilled') {
                        const purchased = kupovinaResponse.value.data.some(c => c.id === parseInt(id));
                        setKupioKurs(purchased);
                    }

                    if (completedResponse.status === 'fulfilled') {
                        setCompletedLessons(new Set(completedResponse.value.data));
                        setCompletedLessonsLoaded(true);
                    }


                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [id, user?.id, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps


    // DODATO: Računanje ukupnog progresa celog kursa
    const totalProgress = useMemo(() => {
        if (lekcije.length === 0) return 0;
        const progress = (completedLessons.size / lekcije.length) * 100;
        return Math.round(progress);
    }, [completedLessons, lekcije]);


    const handleLessonClick = async (lekcijaId) => {
        // Provera da li je lekcija dostupna (da li je korisnik kupio kurs i ima aktivnu pretplatu)
        if (!isCourseAccessible) return;
        const lekcija = lekcije.find(l => l.id === lekcijaId);
        if (!lekcija) return;

        setOtvorenaLekcija(lekcija);
        setCurrentStreamUrl('');
        setReviewFeedback(null);

        if (lekcija.video_url) {
            try {
                const response = await api.get(`/api/lekcije/${lekcija.id}/stream`);
                setCurrentStreamUrl(response.data.url);
            } catch (error) {
                console.error("Greška pri dohvatanju video linka:", error);

                // Ako je 403 error - subscription je istekao
                if (error.response?.status === 403) {
                    console.log('Subscription expired - access denied');
                    setCurrentStreamUrl('subscription_expired');
                } else {
                    alert("Nije moguće učitati video.");
                    setCurrentStreamUrl('error');
                }
            }
        }


        if (lekcija.assignment) {
            setShowEditor(true);
            determineLanguage(lekcija.assignment);
            setCode(savedCodes[lekcijaId] || getDefaultCode(language));
        } else {
            setShowEditor(false);
        }
    };

    // NOVA LOGIKA: Automatsko puštanje lekcije kada se izabere sekcija
    useEffect(() => {
        const sekcijaIdFromUrl = searchParams.get('sekcija');
        // Čekamo da se učitaju lekcije i completedLessons pre nego što odlučimo
        // Takođe proveravamo da li je već otvorena neka lekcija da ne bismo pregazili izbor korisnika
        if (sekcijaIdFromUrl && lekcije.length > 0 && !otvorenaLekcija && user && completedLessonsLoaded) {
            const sekcijaId = parseInt(sekcijaIdFromUrl, 10);
            const lekcijeUSekciji = lekcije.filter(l => l.sekcija_id === sekcijaId);

            if (lekcijeUSekciji.length > 0) {
                // Nađi prvu lekciju koja NIJE završena
                const prvaNezavrsena = lekcijeUSekciji.find(l => !completedLessons.has(l.id));

                // Ako su sve završene (prvaNezavrsena je undefined), pusti prvu u sekciji
                const lekcijaZaPustanje = prvaNezavrsena || lekcijeUSekciji[0];

                if (lekcijaZaPustanje && isCourseAccessible) {
                    handleLessonClick(lekcijaZaPustanje.id);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lekcije, completedLessons, completedLessonsLoaded, searchParams, user, isCourseAccessible]);

    // Navigacija između lekcija
    const handleNextLesson = () => {
        if (!otvorenaLekcija) return;
        const currentIndex = lekcije.findIndex(l => l.id === otvorenaLekcija.id);
        if (currentIndex !== -1 && currentIndex < lekcije.length - 1) {
            handleLessonClick(lekcije[currentIndex + 1].id);
        }
    };

    const handlePrevLesson = () => {
        if (!otvorenaLekcija) return;
        const currentIndex = lekcije.findIndex(l => l.id === otvorenaLekcija.id);
        if (currentIndex > 0) {
            handleLessonClick(lekcije[currentIndex - 1].id);
        }
    };



    const handleCompletionToggle = async (lessonId) => {
        if (!user) return;

        const isCompleted = completedLessons.has(lessonId);
        const updatedCompletedLessons = new Set(completedLessons);

        try {
            if (isCompleted) {
                await api.delete('/api/kompletirane_lekcije', {
                    data: {
                        korisnik_id: user.id,
                        lekcija_id: lessonId
                    }
                });
                // Ako je API poziv uspeo, uklanjamo lekciju iz lokalnog stanja
                updatedCompletedLessons.delete(lessonId);

            } else {
                await api.post('/api/kompletirane_lekcije', {
                    korisnik_id: user.id,
                    kurs_id: id,
                    lekcija_id: lessonId
                });
                updatedCompletedLessons.add(lessonId);
            }
            setCompletedLessons(updatedCompletedLessons);
        } catch (err) {
            console.error("Greška pri ažuriranju statusa lekcije:", err);
        }
    };



    const determineLanguage = (assignment) => {
        const text = assignment.toLowerCase();
        if (text.includes('react') || text.includes('jsx')) setLanguage('javascript');
        else if (text.includes('html')) setLanguage('html');
        else if (text.includes('css')) setLanguage('css');
        else setLanguage('javascript');
    };

    const getDefaultCode = (lang) => {
        switch (lang) {
            case 'html': return '<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n\n</body>\n</html>';
            case 'css': return '/* Add your CSS here */\nbody {\n  margin: 0;\n  padding: 0;\n}';
            default: return '// Unesite svoj JavaScript kod ovde';
        }
    };

    const handleSaveCode = async () => {
        if (!otvorenaLekcija?.id || !user) return;
        try {
            await api.post('/api/saved-codes', {
                user_id: user.id,
                lesson_id: otvorenaLekcija.id,
                code,
                language
            });
            setSavedCodes({ ...savedCodes, [otvorenaLekcija.id]: code });
            alert('Kod je uspešno sačuvan!');
        } catch {
            alert('Došlo je do greške pri čuvanju koda');
        }
    };



    const handleAddToCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (!cart.find(c => c.id === kurs.id)) {
            localStorage.setItem('cart', JSON.stringify([...cart, kurs]));
            window.dispatchEvent(new Event('cart-updated'));
        }
        navigate('/korpa');
    };

    const handleReviewCode = async () => {
        try {
            const { data } = await api.post('/api/lekcije/deepseek-review', { code, language });
            if (data.success) setReviewFeedback({ message: data.message });
            else setReviewFeedback({ message: 'AI nije vratio validan odgovor.', error: data.error });
        } catch (error) {
            setReviewFeedback({ message: 'Greška pri proveri koda.', error: error.message });
        }
    };

    const handleProduziPretplatu = async () => {
        if (!user) return navigate('/login');
        try {
            const response = await api.post('/api/placanje/kreiraj-checkout', {
                kurs_id: kurs.id,
                ime: user.ime,
                prezime: user.prezime,
                email: user.email,
            });
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error("Greška pri produžavanju pretplate:", error);
            alert("Došlo je do greške, molimo pokušajte ponovo.");
        }
    };

    if (!kurs) return <div style={{ padding: '5rem', textAlign: 'center', fontFamily: 'Montserrat' }}>Učitavanje...</div>;

    const renderContentWithLinks = (text) => {
        if (!text) return null;

        // Regex to match URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        // Split text by URL
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.lessonLink}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.badge}>
                    <span className={styles.editorialLine} />
                    Kurs Pristup
                </div>
                <h1 className={styles.title}>{kurs.naziv}</h1>
                <p className={styles.subtitle}>{kurs.opis}</p>
            </div>

            <div className={styles.layoutWrapper}>
                <aside className={styles.sidebarLeft}>
                    <div className={styles.sidebarSticky}>
                        <div className={styles.actionCard}>
                            {!kupioKurs ? (
                                <>
                                    <div className={styles.priceTag}>{kurs.cena} €</div>
                                    <button onClick={handleAddToCart} className={styles.btnPrimary}>Dodaj u korpu</button>
                                </>
                            ) : (
                                <div className={styles.progressWidget}>
                                    <h4>Ukupan Progres</h4>
                                    <div>
                                        <div className={styles.progressInfo}>
                                            <span>Završeno lekcija</span>
                                            <span>
                                                {`${completedLessons.size} / ${lekcije.length}`}
                                            </span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${totalProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className={styles.progressPercentLarge}>{`${totalProgress}%`}</div>
                                </div>
                            )}
                        </div>

                        <div className={styles.lessonsCard}>
                            <h4>Sadržaj</h4>
                            <div className={styles.lessonsScrollable}>
                                {sekcije.map(sekcija => (
                                    <div key={sekcija.id}>
                                        <h5
                                            className={styles.sectionHeader}
                                            onClick={() => setActiveSection(activeSection === sekcija.id ? null : sekcija.id)}
                                        >
                                            {sekcija.naziv}
                                            <span className={`${styles.chevron} ${activeSection === sekcija.id ? styles.chevronExpanded : ''}`} />
                                        </h5>
                                        {activeSection === sekcija.id && (
                                            <ul className={styles.lessonsList}>
                                                {lekcije
                                                    .filter(l => l.sekcija_id === sekcija.id)
                                                    .map(lekcija => {
                                                        const isActive = otvorenaLekcija?.id === lekcija.id;
                                                        const isDisabled = !isCourseAccessible;
                                                        
                                                        return (
                                                            <li
                                                                key={lekcija.id}
                                                                className={`${styles.lessonItem} ${isActive ? styles.lessonItemActive : ''} ${isDisabled ? styles.lessonItemDisabled : ''}`}
                                                                onClick={() => isCourseAccessible && handleLessonClick(lekcija.id)}
                                                            >
                                                                <div className={styles.lessonTitle}>
                                                                    {lekcija.assignment ? <AssignmentIcon /> : <PlayIcon />}
                                                                    <span>{lekcija.title}</span>
                                                                </div>
                                                                {isCourseAccessible && (
                                                                    <label className={styles.checkboxWrapper} title="Označi kao završeno">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={completedLessons.has(lekcija.id)}
                                                                            onChange={e => {
                                                                                e.stopPropagation();
                                                                                handleCompletionToggle(lekcija.id);
                                                                            }}
                                                                            className={styles.hiddenCheckbox}
                                                                        />
                                                                        <span className={styles.checkmark}></span>
                                                                    </label>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <div className={styles.mainRight}>
                    {!kupioKurs ? (
                        <div className={`${styles.welcomeCard} ${styles.stateCta}`}>
                            <h2>Učlanite se da biste pristupili</h2>
                            <p>Dodajte kurs u korpu i započnite učenje danas!</p>
                            <button onClick={handleAddToCart} className={styles.btnPrimary} style={{ maxWidth: '300px', marginTop: '2rem' }}>Dodaj u korpu</button>
                        </div>
                    ) : !isCourseAccessible ? (
                        <div className={`${styles.welcomeCard} ${styles.stateExpired}`}>
                            <h2>Vaša pretplata je istekla!</h2>
                            <p>Da biste nastavili sa pristupom ovom kursu, molimo Vas da produžite svoju pretplatu.</p>
                            <button onClick={() => navigate('/produzivanje')} className={styles.btnPrimary} style={{ maxWidth: '300px', marginTop: '2rem' }}>Produži Pretplatu</button>
                        </div>
                    ) : !otvorenaLekcija ? (
                        <div className={styles.welcomeCard}>
                            <h2>Dobro došli nazad!</h2>
                            <p>Izaberite lekciju iz uvodne sekcije ili liste sa strane da biste nastavili sa učenjem.</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.playerCard}>
                                <div className={styles.playerCardHeader}>
                                    <h3 className={styles.playerCardTitle}>{otvorenaLekcija.title}</h3>
                                </div>
                                
                                {otvorenaLekcija.video_url && (
                                    <div className={styles.playerWrapper}>
                                        {!currentStreamUrl && <div className={styles.playerPlaceholder}>Učitavanje videa...</div>}
                                        {currentStreamUrl === 'error' && <div className={styles.playerPlaceholder}>Greška pri učitavanju videa.</div>}
                                        {currentStreamUrl === 'subscription_expired' && (
                                            <div className={`${styles.welcomeCard} ${styles.stateExpired}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', padding: '2rem', border: 'none' }}>
                                                <h2>Pretplata istekla</h2>
                                                <button onClick={() => navigate('/produzivanje')} className={styles.btnPrimary} style={{ maxWidth: '200px', marginTop: '1rem' }}>Produži</button>
                                            </div>
                                        )}
                                        {currentStreamUrl && currentStreamUrl !== 'error' && currentStreamUrl !== 'subscription_expired' && (
                                            <iframe
                                                src={currentStreamUrl}
                                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                                allowFullScreen={true}
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                                title={otvorenaLekcija.title}
                                            ></iframe>
                                        )}
                                    </div>
                                )}

                                <div className={styles.navigationControls}>
                                    <button
                                        className={styles.btnSecondary}
                                        style={{ width: 'auto' }}
                                        onClick={handlePrevLesson}
                                        disabled={lekcije.findIndex(l => l.id === otvorenaLekcija.id) <= 0}
                                    >
                                        <RiArrowLeftSLine /> Prethodna
                                    </button>

                                    <div className={styles.currentLessonName}>
                                        {otvorenaLekcija.title}
                                    </div>

                                    <button
                                        className={styles.btnSecondary}
                                        style={{ width: 'auto' }}
                                        onClick={handleNextLesson}
                                        disabled={lekcije.findIndex(l => l.id === otvorenaLekcija.id) >= lekcije.length - 1}
                                    >
                                        Sledeca <RiArrowRightSLine />
                                    </button>
                                </div>

                                <div className={styles.textContent}>
                                    {renderContentWithLinks(otvorenaLekcija.content)}
                                </div>
                            </div>

                            {otvorenaLekcija.assignment && (
                                <div className={styles.assignmentCard}>
                                    <h3>Zadatak</h3>
                                    <p className={styles.assignmentText}>{otvorenaLekcija.assignment}</p>
                                    {showEditor && (
                                        <div className={styles.editorWrapper}>
                                            <div className={styles.editorHeader}>
                                                <h4>Code Editor</h4>
                                                <select 
                                                    className={styles.editorSelect}
                                                    value={language} 
                                                    onChange={e => setLanguage(e.target.value)}
                                                >
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="html">HTML</option>
                                                    <option value="css">CSS</option>
                                                </select>
                                            </div>
                                            <Editor
                                                height="400px"
                                                language={language}
                                                theme="light"
                                                value={code}
                                                onChange={setCode}
                                                options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', padding: { top: 16 } }}
                                            />
                                            <div className={styles.editorActions}>
                                                <button className={styles.btnSecondary} onClick={handleSaveCode} style={{ width: 'auto' }}>Sačuvaj Kod</button>
                                                <button className={styles.btnPrimary} onClick={handleReviewCode} style={{ width: 'auto' }}>Proveri Kod (AI)</button>
                                            </div>
                                            {reviewFeedback && (
                                                <div className={styles.aiFeedback}>
                                                    <h4>AI Povratna Informacija:</h4>
                                                    <pre>{reviewFeedback.message}</pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div >
        </div >
    );
};

export default KursDetalj;