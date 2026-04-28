import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../login/api";
import { useAuth } from "../login/auth";
import styles from "./KupljenKurs.module.css";
import keyikonica from '../icons/key.png';
import moneybag from '../icons/money-bag.png';
import wave from '../icons/wave-sound.png';
import startup from '../icons/startup.png';
import crystal2 from '../icons/crystal2.png';
import potion from '../icons/potion.png';
import sword from '../icons/sword.png';
import krunica from '../icons/krunica.png';
import { SiBlender } from "react-icons/si";
import { RiHandHeartLine, RiLightbulbFlashLine, RiToolsLine } from "react-icons/ri";

// Niz sa klasama za ikonice.
const sectionIcons = [
    RiHandHeartLine,
    keyikonica,    // Ključ (za uvodne koncepte)
    potion,        // Napitak (za osnove)
    SiBlender,     // Blender sekcija
    wave,          // Zvuk (za audio)
    crystal2,      // Kristal (za vizuelne efekte)
    moneybag,      // Novac (za monetizaciju)
    sword,         // Mač (za napredne tehnike)
    startup,       // Raketa (za eksportovanje)
    krunica,
    RiLightbulbFlashLine, // Sijalica (za ideje)
    RiToolsLine  // Alati (za tehničke veštine)
];

const KupljenKurs = () => {
    const [sviKupljeniKursevi, setSviKupljeniKursevi] = useState([]);
    const [selektovaniKursId, setSelektovaniKursId] = useState("");
    const [progresPoSekcijama, setProgresPoSekcijama] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSekcija, setIsLoadingSekcija] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    // Dohvata sve kupljene kurseve i automatski postavlja prvi kao selektovani
    useEffect(() => {
        const fetchKupljeneKurseve = async () => {
            if (user && user.id) {
                try {
                    setIsLoading(true);
                    const response = await api.get(`/api/kupovina/user/${user.id}`);
                    const kursevi = response.data;
                    setSviKupljeniKursevi(kursevi);

                    if (kursevi && kursevi.length > 0) {
                        setSelektovaniKursId(kursevi[0].id);
                    }

                } catch (error) {
                    console.error("Greška pri dohvatanju kupljenih kurseva:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        fetchKupljeneKurseve();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]); // Koristi user?.id umesto user da se ne trigeruje na svaki re-render

    // Dohvata progres za automatski selektovani kurs
    useEffect(() => {
        const fetchProgresPoSekcijama = async () => {
            if (selektovaniKursId && user && user.id) {
                try {
                    setIsLoadingSekcija(true);
                    setProgresPoSekcijama([]); // Resetuj prethodne podatke
                    const response = await api.get(
                        `/api/kursevi/progres-sekcija/${selektovaniKursId}/korisnik/${user.id}`
                    );
                    setProgresPoSekcijama(response.data);
                } catch (error) {
                    console.error("Greška pri dohvatanju progresa po sekcijama:", error);
                } finally {
                    setIsLoadingSekcija(false);
                }
            }
        };
        fetchProgresPoSekcijama();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selektovaniKursId, user?.id]); // Koristi user?.id umesto user


    if (isLoading) {
        return (
            <div className={styles.wrapper}>
                <p className={styles.loadingText}>Učitavanje kursa...</p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.watermark}>LEKCIJE</div>
            
            <div className={styles.header}>
                <div className={styles.badge}>
                    <span className={styles.editorialLine} />
                    Vaša Edukacija
                </div>
                <h1 className={styles.title}>Lekcije</h1>
            </div>

            {isLoadingSekcija && <p className={styles.loadingText}>Učitavanje sekcija...</p>}

            {!isLoadingSekcija && progresPoSekcijama.length > 0 && (
                <div className={styles.gridContainer}>
                    {progresPoSekcijama.map((sekcija, index) => {
                        const iconClass = sectionIcons[index % sectionIcons.length];
                        const isStarted = sekcija.progres > 0;

                        return (
                            <div key={sekcija.sekcija_id} className={styles.card}>
                                <div className={styles.imageWrapper}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.iconContainer}>
                                            {typeof iconClass === 'string' && iconClass.startsWith('ri-') ? (
                                                <i className={iconClass}></i>
                                            ) : typeof iconClass === 'function' || typeof iconClass === 'object' ? (
                                                React.createElement(iconClass)
                                            ) : (
                                                <img src={iconClass} alt="ikona" className={styles.pngIcon} />
                                            )}
                                        </div>
                                    </div>
                                    <img
                                        src={sekcija.thumbnail}
                                        alt={`Sekcija ${sekcija.naziv_sekcije}`}
                                        className={styles.cardImage}
                                    />
                                </div>

                                <div className={styles.cardBody}>
                                    <h3 className={styles.sectionTitle}>{sekcija.naziv_sekcije}</h3>
                                    
                                    <div className={styles.progressContainer}>
                                        <div className={styles.progressInfo}>
                                            <h4 className={styles.progressLabel}>Progres</h4>
                                            <span className={styles.progressPercentage}>
                                                {`${sekcija.progres || 0}%`}
                                            </span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${sekcija.progres || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/kurs/${selektovaniKursId}?sekcija=${sekcija.sekcija_id}`)}
                                        className={`${styles.actionBtn} ${isStarted ? styles.primaryAction : ''}`}
                                    >
                                        {isStarted ? 'NASTAVI UČENJE' : 'ZAPOČNI SEKCIJU'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {!isLoading && !isLoadingSekcija && selektovaniKursId && progresPoSekcijama.length === 0 && (
                <p className={styles.emptyStateText}>Ovaj kurs trenutno nema definisane sekcije.</p>
            )}

            {!isLoading && sviKupljeniKursevi.length === 0 && (
                <p className={styles.emptyStateText}>Nemate kupljenih kurseva.</p>
            )}
        </div>
    );
};

export default KupljenKurs;