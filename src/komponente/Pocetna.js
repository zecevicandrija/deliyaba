import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pocetna.css';
import rezultat5 from '../images/rezultat31.png';
import rezultat2 from '../images/rezultati23.png'
import rezultat3 from '../images/rezultat32.png'
import rezultat4 from '../images/rezultati4.png'
import { useInView } from 'react-intersection-observer';
import ONama from '../pocetna/ONama';
import Program from '../pocetna/Program';

import Rezultati from '../pocetna/Rezultati';
import Proces from '../pocetna/Proces';
import CTA from '../pocetna/CTA';

// IMPORTUJEMO NOVU KOMPONENTU
import Hero from '../pocetna/Hero';
import Features from '../pocetna/Features';
import FAQ from '../pocetna/FAQ';
import Motion from '../pocetna/Motion';

const ChevronIcon = ({ isOpen }) => <i className={`ri-arrow-down-s-line accordion-chevron ${isOpen ? 'open' : ''}`}></i>;

const AnimateOnScroll = ({ children }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <div ref={ref} className={`fade-in-section ${inView ? 'is-visible' : ''}`}>
            {children}
        </div>
    );
};


const Pocetna = () => {
    const navigate = useNavigate();
    return (
        <div className="pocetna-wrapper">
            <main className="pocetna-page">
                {/* 3. OBMOTAVAMO SVAKU SEKCIJU */}

                {/* HERO — NEMA AnimateOnScroll jer transform ubija sticky! */}
                <Hero navigate={navigate} />

                <ONama navigate={navigate} />

                <Rezultati navigate={navigate} />

                {/* REZULTATI - Sadrze sopstvene scroll pins i triggere, pa nema wrapper */}
                <Program navigate={navigate} />

                <Proces navigate={navigate} />

                <CTA navigate={navigate} />

                {/* <AnimateOnScroll>
                    <Motion navigate={navigate} />
                </AnimateOnScroll>

                <AnimateOnScroll>
                    <Features navigate={navigate} />
                </AnimateOnScroll>

                <AnimateOnScroll>
                    <FAQ navigate={navigate} />
                </AnimateOnScroll> */}
            </main>
        </div>
    );
};

export default Pocetna;