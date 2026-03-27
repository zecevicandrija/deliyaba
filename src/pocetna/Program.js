import React, { useEffect, useRef, useState } from 'react';
import styles from './Program.module.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Program = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const rowsRef = useRef([]);
  // Prvi red otvoren po defaultu (01)
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.isVisible);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (headerRef.current) observer.observe(headerRef.current);

    // Čišćenje i ponovno dodavanje observer-a na redove koji postoje
    rowsRef.current.forEach((row) => {
      if (row) observer.observe(row);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Svaki put kada se promeni otvoren/zatvoren tab, 
    // cekamo da se CSS animacija (0.6s) završi, pa onda radimo refresh.
    // Stavio sam 650ms (malo više od 0.6s) da budemo sigurni da je DOM stabilan.
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 650);

    // Čišćenje timeouta ako korisnik brzo klika
    return () => clearTimeout(timer);
  }, [openIndex]);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const programs = [
    {
      index: '01',
      title: 'BARBER OSNOVE',
      meta: '12 SEDMICA // POČETNICI',
      desc: 'Savladajte temelje klasičnog berberstva, precizno šišanje i tradicionalne tehnike brijanja. Intenzivni program u trajanju od 12 sedmica.',
      image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a',
      features: [
        'Osnove berberstva',
        'Dizajn i geometrija šišanja',
        'Napredne fade tehnike',
        'Brijanje i dizajn brade',
        'Higijena i održavanje alata'
      ]
    },
    {
      index: '02',
      title: 'MASTERCLASS',
      meta: '4 SEDMICE // NAPREDNI',
      desc: 'Podigni svoje fade vještine na najviši mogući nivo. Fokus je na brzini, teksturi i savršenim prelazima bez ijedne linije.',
      image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c',
      features: [
        'Napredne tehnike sjenčenja',
        'Upotreba makaza iznad češlja',
        'Detaljisanje i oštre konture',
        'Brzina bez gubitka kvaliteta'
      ]
    },
    {
      index: '03',
      title: 'NAPREDNE FADE TEHNIKE',
      meta: '2 SEDMICE // STRUČNJACI',
      desc: 'Savladaj tranzicije, skin fade i taper fade sa nevjerovatnom oštrinom i fluidnošću, koristeći premijum alate.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1',
      features: [
        'Micro-detaljisanje makazama',
        'Skin fade i taper struktura',
        'Rad sa različitim teksturama kose',
        'Efikasnost i vrijeme rada'
      ]
    },
    {
      index: '04',
      title: 'BRIJANJE I DIZAJN BRADE',
      meta: '1 SEDMICA // SPECIJALIZACIJA',
      desc: 'Sve o oblikovanju brade, spa tretmanima sa vrućim peškirom i radu sa britvom za pravi luksuzni doživljaj.',
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70',
      features: [
        'Spa tretman i vrući peškirom',
        'Oblikovanje brade prema licu',
        'Pravilna upotreba britve',
        'Njega i profesionalni proizvodi'
      ]
    }
  ];

  return (
    <section className={styles.programsSection} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.sectionHeader} ref={headerRef}>
          <h2 className={styles.sectionTitle}>Programi Edukacije</h2>
        </div>

        <div className={styles.accordionList}>
          {programs.map((prog, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                className={`${styles.row} ${isOpen ? styles.isOpen : ''}`}
                key={i}
                ref={el => {
                  if (el) rowsRef.current[i] = el;
                }}
              >
                <div className={styles.rowHeader} onClick={() => toggleAccordion(i)}>
                  <span className={styles.index}>{prog.index}</span>
                  <h3 className={styles.rowTitle}>{prog.title}</h3>
                  <span className={styles.meta}>{prog.meta}</span>
                  <span className={styles.toggleIcon}>—</span>
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
                          PRIJAVI SE <span className={styles.arrow}>↗</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Program;
