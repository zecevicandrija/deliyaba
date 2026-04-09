'use client';
import React, { useRef, useEffect } from 'react';
import styles from './Proces.module.css';

// 1. UKLANJAMO statičke importe za GSAP na vrhu fajla!
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

import img1 from '../images/deliyaslike/deliya11.webp';
import img2 from '../images/deliyaslike/deliya5.webp';
import img3 from '../images/deliyaslike/deliya32.webp';
import img4 from '../images/deliyaslike/deliya33.webp';

const procesData = [
    { num: '01', title: 'OSNOVE I DISCIPLINA', desc: 'Razvijaš profesionalne navike od prvog dana — pravilno držanje alata, čistoća radnog prostora i odnos prema klijentu. Ovde gradiš temelj koji razlikuje amatera od ozbiljnog frizera.', bg: img1 },
    { num: '02', title: 'TEHNIKA', desc: 'Savladavaš precizne tehnike šišanja — fade prelaze, rad sa mašinicom i makazama, kao i kontrolu svake linije. Fokus je na čistom, konzistentnom rezultatu bez grešaka.', bg: img2 },
    { num: '03', title: 'RAD SA KLIJENTIMA', desc: 'Učiš kako da vodiš razgovor, razumeš zahteve klijenta i daješ profesionalne preporuke. Cilj je da izgradiš poverenje i pretvoriš svakog klijenta u stalnog.', bg: img3 },
    { num: '04', title: 'SAMOSTALNI RAD', desc: 'Primena znanja u realnim situacijama — organizacija rada, brzina, kvalitet i naplata usluge. Priprema za izlazak na tržište i izgradnju sopstvenog, profitabilnog posla.', bg: img4 }
];

const Proces = () => {
    const triggerRef = useRef(null);
    const containerRef = useRef(null);
    const progressBarRef = useRef(null);

    const nodeRefs = useRef([]);
    const stepRefs = useRef([]);
    const bgRefs = useRef([]);

    // 2. Dodajemo ref koji će čuvati naš GSAP kontekst za potrebe čišćenja
    const ctxRef = useRef(null);

    useEffect(() => {
        let isMounted = true; // Zastavica da proverimo da li je komponenta i dalje na ekranu

        const loadGSAP = async () => {
            try {
                // 3. Dinamički importujemo GSAP i ScrollTrigger tek kada se komponenta montira
                const gsapModule = await import('gsap');
                const scrollTriggerModule = await import('gsap/ScrollTrigger');

                // Podrška za različite module bundler-e (izvlačimo default export)
                const gsap = gsapModule.default || gsapModule;
                const ScrollTrigger = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;

                // Ako je korisnik u međuvremenu napustio stranicu (pre nego što se GSAP učitao), prekidamo
                if (!isMounted) return;

                gsap.registerPlugin(ScrollTrigger);

                // Kreiramo kontekst i čuvamo ga u ref-u
                ctxRef.current = gsap.context(() => {
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: triggerRef.current,
                            pin: containerRef.current,
                            start: 'top top',
                            end: '+=400%',
                            scrub: 1.2,
                            pinSpacing: true,
                            anticipatePin: 1
                        }
                    });

                    // Zadržane su sve prethodne optimizacije (samo opacity, bez maski)
                    gsap.set(stepRefs.current, { opacity: 0, y: 50 });
                    gsap.set(stepRefs.current[0], { opacity: 1, y: 0 });

                    gsap.set(bgRefs.current, { opacity: 0 });
                    gsap.set(bgRefs.current[0], { opacity: 0.15 });

                    gsap.set(nodeRefs.current, { scale: 1, opacity: 0.4 });
                    gsap.set(nodeRefs.current[0], { scale: 1.3, opacity: 1 });

                    tl.to(progressBarRef.current, { scaleY: 1, ease: 'none', duration: 4.5 }, 0);

                    // TRANZICIJA 0 -> 1
                    tl.to(stepRefs.current[0], { opacity: 0, y: -50, duration: 0.5, ease: 'power1.inOut' }, 0.5);
                    tl.to(bgRefs.current[0], { opacity: 0, duration: 0.5, ease: 'power1.inOut' }, 0.5);
                    tl.to(nodeRefs.current[0], { scale: 1, opacity: 0.4, duration: 0.5 }, 0.5);

                    tl.to(stepRefs.current[1], { opacity: 1, y: 0, duration: 0.5, ease: 'power1.out' }, 0.9);
                    tl.to(bgRefs.current[1], { opacity: 0.15, duration: 0.5, ease: 'power1.inOut' }, 0.9);
                    tl.to(nodeRefs.current[1], { scale: 1.3, opacity: 1, duration: 0.5 }, 0.9);

                    // TRANZICIJA 1 -> 2
                    tl.to(stepRefs.current[1], { opacity: 0, y: -50, duration: 0.5, ease: 'power1.inOut' }, 1.8);
                    tl.to(bgRefs.current[1], { opacity: 0, duration: 0.5, ease: 'power1.inOut' }, 1.8);
                    tl.to(nodeRefs.current[1], { scale: 1, opacity: 0.4, duration: 0.5 }, 1.8);

                    tl.to(stepRefs.current[2], { opacity: 1, y: 0, duration: 0.5, ease: 'power1.out' }, 2.2);
                    tl.to(bgRefs.current[2], { opacity: 0.15, duration: 0.5, ease: 'power1.inOut' }, 2.2);
                    tl.to(nodeRefs.current[2], { scale: 1.3, opacity: 1, duration: 0.5 }, 2.2);

                    // TRANZICIJA 2 -> 3
                    tl.to(stepRefs.current[2], { opacity: 0, y: -50, duration: 0.5, ease: 'power1.inOut' }, 3.1);
                    tl.to(bgRefs.current[2], { opacity: 0, duration: 0.5, ease: 'power1.inOut' }, 3.1);
                    tl.to(nodeRefs.current[2], { scale: 1, opacity: 0.4, duration: 0.5 }, 3.1);

                    tl.to(stepRefs.current[3], { opacity: 1, y: 0, duration: 0.5, ease: 'power1.out' }, 3.5);
                    tl.to(bgRefs.current[3], { opacity: 0.15, duration: 0.5, ease: 'power1.inOut' }, 3.5);
                    tl.to(nodeRefs.current[3], { scale: 1.3, opacity: 1, duration: 0.5 }, 3.5);

                    // KONAČNI IZLAZ
                    tl.to(stepRefs.current[3], { opacity: 0, y: -50, duration: 0.5, ease: 'power1.inOut' }, 4.3);

                }, triggerRef);

            } catch (error) {
                console.error("Greška pri učitavanju GSAP-a:", error);
            }
        };

        // Pozivamo asinhronu funkciju
        loadGSAP();

        // 4. Cleanup funkcija sada čisti preko sačuvanog ref-a
        return () => {
            isMounted = false;
            if (ctxRef.current) {
                ctxRef.current.revert();
            }
        };
    }, []);

    return (
        <div ref={triggerRef} className={styles.triggerWrapper}>
            <section id="proces" className={styles.scrollContainer} ref={containerRef}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionLabel}>SISTEM RADA</span>
                    <h2 className={styles.mainTitle}>PROCES UČENJA.</h2>
                </div>

                <div className={styles.bgContainer}>
                    {procesData.map((data, i) => (
                        <img
                            key={`bg-${i}`}
                            ref={el => bgRefs.current[i] = el}
                            src={data.bg}
                            alt={`Context bg ${i}`}
                            className={styles.bgImage}
                        />
                    ))}
                    <div className={styles.bgOverlayMask}></div>
                </div>

                <div className={styles.stickyWrapper}>
                    <div className={styles.leftColumn}>
                        <div className={styles.spineTrack}>
                            <div className={styles.spineProgress} ref={progressBarRef}></div>
                            <div className={styles.spineNodes}>
                                {procesData.map((step, i) => (
                                    <div
                                        key={`node-${i}`}
                                        className={styles.node}
                                        ref={el => nodeRefs.current[i] = el}
                                    >
                                        {step.num}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.overlayBlocksContainer}>
                            {procesData.map((step, i) => (
                                <div
                                    key={`step-${i}`}
                                    className={styles.overlayBlock}
                                    ref={el => stepRefs.current[i] = el}
                                >
                                    <h2 className={styles.stepTitle}>{step.title}</h2>
                                    <p className={styles.stepDesc}>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Proces;