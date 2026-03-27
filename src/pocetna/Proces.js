'use client';
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Proces.module.css';
import barber12 from '../images/barber12.jpg';

gsap.registerPlugin(ScrollTrigger);

const procesData = [
    {
        num: '01',
        title: 'OSNOVE I DISCIPLINA',
        desc: 'Razvijaš profesionalne navike od prvog dana — pravilno držanje alata, čistoća radnog prostora i odnos prema klijentu. Ovde gradiš temelj koji razlikuje amatera od ozbiljnog frizera.',
        bg: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2670&auto=format&fit=crop'
    },
    {
        num: '02',
        title: 'TEHNIKA',
        desc: 'Savladavaš precizne tehnike šišanja — fade prelaze, rad sa mašinicom i makazama, kao i kontrolu svake linije. Fokus je na čistom, konzistentnom rezultatu bez grešaka.',
        bg: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2670&auto=format&fit=crop'
    },
    {
        num: '03',
        title: 'RAD SA KLIJENTIMA',
        desc: 'Učiš kako da vodiš razgovor, razumeš zahteve klijenta i daješ profesionalne preporuke. Cilj je da izgradiš poverenje i pretvoriš svakog klijenta u stalnog.',
        bg: barber12
    },
    {
        num: '04',
        title: 'SAMOSTALNI RAD',
        desc: 'Primena znanja u realnim situacijama — organizacija rada, brzina, kvalitet i naplata usluge. Priprema za izlazak na tržište i izgradnju sopstvenog, profitabilnog posla.',
        bg: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2670&auto=format&fit=crop'
    }
];


const Proces = () => {
    const triggerRef = useRef(null); // NOVO: Omotač koji služi kao okidač
    const containerRef = useRef(null); // Ovo se pinuje
    const progressBarRef = useRef(null);

    const nodeRefs = useRef([]);
    const stepRefs = useRef([]);
    const bgRefs = useRef([]);

    useEffect(() => {
        let ctx = gsap.context(() => {

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: triggerRef.current, // Okidač je sada spoljni div
                    pin: containerRef.current,   // Pinujemo unutrašnji div
                    start: 'top top',
                    end: '+=400%',
                    scrub: 1,                    // Malo veći scrub za glatkoću (opciono, može i 0.8)
                    pinSpacing: true,            // GSAP dodaje prostor za skrol
                    // UKLONJENO: anticipatePin, fastScrollEnd, preventOverlaps (oni su često krivci za trzanje)
                }
            });

            // Set Initial States
            gsap.set(stepRefs.current, { autoAlpha: 0, y: 100 });
            gsap.set(stepRefs.current[0], { autoAlpha: 1, y: 0 });

            gsap.set(bgRefs.current, { autoAlpha: 0 });
            gsap.set(bgRefs.current[0], { autoAlpha: 0.15 });

            gsap.set(nodeRefs.current, { color: '#333', scale: 1 });
            gsap.set(nodeRefs.current[0], { color: '#145ead', scale: 1.3, textShadow: '0 0 15px rgba(20,94,173,0.5)' });

            // Progress Bar
            tl.to(progressBarRef.current, { height: '100%', ease: 'none', duration: 4.5 }, 0);

            // ... OSTATAK TVOJE TIMELINE ANIMACIJE OSTAJE POTPUNO ISTI ...
            // 0 -> 1
            tl.to(stepRefs.current[0], { autoAlpha: 0, y: -150, duration: 0.5, ease: 'power2.in' }, 0.5);
            tl.to(bgRefs.current[0], { autoAlpha: 0, duration: 0.5 }, 0.5);
            tl.to(nodeRefs.current[0], { color: '#333', scale: 1, textShadow: 'none', duration: 0.5 }, 0.5);

            tl.to(stepRefs.current[1], { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.9);
            tl.to(bgRefs.current[1], { autoAlpha: 0.15, duration: 0.5 }, 0.9);
            tl.to(nodeRefs.current[1], { color: '#145ead', scale: 1.3, textShadow: '0 0 15px rgba(20,94,173,0.5)', duration: 0.5 }, 0.9);

            // 1 -> 2
            tl.to(stepRefs.current[1], { autoAlpha: 0, y: -150, duration: 0.5, ease: 'power2.in' }, 1.8);
            tl.to(bgRefs.current[1], { autoAlpha: 0, duration: 0.5 }, 1.8);
            tl.to(nodeRefs.current[1], { color: '#333', scale: 1, textShadow: 'none', duration: 0.5 }, 1.8);

            tl.to(stepRefs.current[2], { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 2.2);
            tl.to(bgRefs.current[2], { autoAlpha: 0.15, duration: 0.5 }, 2.2);
            tl.to(nodeRefs.current[2], { color: '#145ead', scale: 1.3, textShadow: '0 0 15px rgba(20,94,173,0.5)', duration: 0.5 }, 2.2);

            // 2 -> 3
            tl.to(stepRefs.current[2], { autoAlpha: 0, y: -150, duration: 0.5, ease: 'power2.in' }, 3.1);
            tl.to(bgRefs.current[2], { autoAlpha: 0, duration: 0.5 }, 3.1);
            tl.to(nodeRefs.current[2], { color: '#333', scale: 1, textShadow: 'none', duration: 0.5 }, 3.1);

            tl.to(stepRefs.current[3], { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 3.5);
            tl.to(bgRefs.current[3], { autoAlpha: 0.15, duration: 0.5 }, 3.5);
            tl.to(nodeRefs.current[3], { color: '#145ead', scale: 1.3, textShadow: '0 0 15px rgba(20,94,173,0.5)', duration: 0.5 }, 3.5);

            // Konačni izlaz
            tl.to(stepRefs.current[3], { autoAlpha: 0, y: -150, duration: 0.5, ease: 'power2.in' }, 4.3);

        }, triggerRef); // Kontekst sada posmatra triggerRef

        return () => ctx.revert();
    }, []);

    return (
        <div ref={triggerRef} className={styles.triggerWrapper}>
            <section className={styles.scrollContainer} ref={containerRef}>

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