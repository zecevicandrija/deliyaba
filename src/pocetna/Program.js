'use client';
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import styles from './Program.module.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import img1 from '../images/deliyaslike/deliya15.webp';
import img2 from '../images/deliyaslike/deliya7.webp';
import img3 from '../images/deliyaslike/deliya20.webp';
import img4 from '../images/deliyaslike/deliya23.webp';

const programs = [
  // ... (Tvoj postojeći niz ostaje potpuno isti, možeš ga ostaviti i unutar komponente, 
  // ali je praksa bolja da statički podaci budu van nje da se ne kreiraju na svaki render)
  {
    index: '01',
    title: 'BARBER OSNOVE',
    meta: '12 SEDMICA // POČETNICI',
    desc: 'Savladajte temelje klasičnog berberstva, precizno šišanje i tradicionalne tehnike brijanja. Intenzivni program u trajanju od 12 sedmica.',
    image: img1,
    features: ['Osnove berberstva', 'Dizajn i geometrija šišanja', 'Napredne fade tehnike', 'Brijanje i dizajn brade', 'Higijena i održavanje alata']
  },
  {
    index: '02',
    title: 'MASTERCLASS',
    meta: '4 SEDMICE // NAPREDNI',
    desc: 'Podigni svoje fade vještine na najviši mogući nivo. Fokus je na brzini, teksturi i savršenim prelazima bez ijedne linije.',
    image: img2,
    features: ['Napredne tehnike sjenčenja', 'Upotreba makaza iznad češlja', 'Detaljisanje i oštre konture', 'Brzina bez gubitka kvaliteta']
  },
  {
    index: '03',
    title: 'NAPREDNE FADE TEHNIKE',
    meta: '2 SEDMICE // STRUČNJACI',
    desc: 'Savladaj tranzicije, skin fade i taper fade sa nevjerovatnom oštrinom i fluidnošću, koristeći premijum alate.',
    image: img3,
    features: ['Micro-detaljisanje makazama', 'Skin fade i taper struktura', 'Rad sa različitim teksturama kose', 'Efikasnost i vrijeme rada']
  },
  {
    index: '04',
    title: 'BRIJANJE I DIZAJN BRADE',
    meta: '1 SEDMICA // SPECIJALIZACIJA',
    desc: 'Sve o oblikovanju brade, spa tretmanima sa vrućim peškirom i radu sa britvom za pravi luksuzni doživljaj.',
    image: img4,
    features: ['Spa tretman i vrući peškirom', 'Oblikovanje brade prema licu', 'Pravilna upotreba britve', 'Njega i profesionalni proizvodi']
  }
];

// 1. Izdvajamo svaki tab u memoizovanu komponentu. 
// Ovo sprečava da se ostala 3 taba renderuju iznova kada otvoriš samo jedan.
const ProgramItem = memo(({ prog, index, isOpen, toggleAccordion, setRowRef }) => {
  return (
    <div
      className={`${styles.row} ${isOpen ? styles.isOpen : ''}`}
      ref={setRowRef}
    >
      <div className={styles.rowHeader} onClick={() => toggleAccordion(index)}>
        <span className={styles.index}>{prog.index}</span>
        <h3 className={styles.rowTitle}>{prog.title}</h3>
        <span className={styles.meta}>{prog.meta}</span>
        <span className={styles.toggleIcon}>{isOpen ? '—' : '+'}</span>
      </div>

      <div className={`${styles.accordionContent} ${isOpen ? styles.isOpen : ''}`}>
        <div className={styles.accordionInner}>
          <div className={styles.contentWrapper}>
            <div className={styles.imageContainer}>
              <img
                src={prog.image}
                alt={prog.title}
                className={styles.image}
                loading="lazy"
              />
            </div>
            <div className={styles.detailsContainer}>
              <p className={styles.desc}>{prog.desc}</p>
              <ul className={styles.featureList}>
                {prog.features.map((feat, j) => (
                  <li key={j}>{feat}</li>
                ))}
              </ul>
              <a href="/paket" className={styles.prijaviSe} onClick={(e) => e.preventDefault()}>
                PRIJAVI SE
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const Program = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const rowsRef = useRef([]);
  const [openIndex, setOpenIndex] = useState(0);

  // Intersection Observer za Fade-In animacije
  useEffect(() => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.isVisible);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    if (headerRef.current) observer.observe(headerRef.current);

    // Kopiramo trenutni niz ref-ova kako bi se ispravno očistili u cleanup funkciji
    const currentRows = rowsRef.current;
    currentRows.forEach((row) => {
      if (row) observer.observe(row);
    });

    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current);
      currentRows.forEach((row) => {
        if (row) observer.unobserve(row);
      });
    };
  }, []);

  // 2. ResizeObserver: Gleda samu visinu cele sekcije!
  // Nema više fiksnog setTimeout-a. Kad god se visina DOM-a promeni 
  // (zbog animacije taba ili učitavanja slike), GSAP dobija obaveštenje.
  useEffect(() => {
    let timeoutId;

    const resizeObserver = new ResizeObserver(() => {
      // Koristimo kratak debounce (100ms) da ne bismo preopteretili procesor 
      // i oborili FPS pozivajući ScrollTrigger.refresh() 60 puta u sekundi tokom css tranzicije.
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    });

    if (sectionRef.current) {
      resizeObserver.observe(sectionRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  // 3. useCallback sprečava nepotrebno re-kreiranje funkcije
  const toggleAccordion = useCallback((index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);

  return (
    <section id="program" className={styles.programsSection} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.sectionHeader} ref={headerRef}>
          <h2 className={styles.sectionTitle}>Programi Edukacije</h2>
        </div>

        <div className={styles.accordionList}>
          {programs.map((prog, i) => (
            <ProgramItem
              key={prog.index}
              prog={prog}
              index={i}
              isOpen={openIndex === i}
              toggleAccordion={toggleAccordion}
              setRowRef={(el) => (rowsRef.current[i] = el)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Program;