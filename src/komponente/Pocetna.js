import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pocetna.css';
import { useInView } from 'react-intersection-observer';

// HERO SE UČITAVA ODMAH (EAGER)
import Hero from '../pocetna/Hero';

// OSTALE SEKCIJE SE UČITAVAJU NAKNADNO (LAZY)
const ONama = lazy(() => import('../pocetna/ONama'));
const Program = lazy(() => import('../pocetna/Program'));
const Rezultati = lazy(() => import('../pocetna/Rezultati'));
const Proces = lazy(() => import('../pocetna/Proces'));
const CTA = lazy(() => import('../pocetna/CTA'));
const Jedan = lazy(() => import('../pocetna/Jedan'));

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

// Fallback skeleton ili prazan div za glatko iskustvo skrolovanja
const SectionLoader = () => <div style={{ height: '50vh' }}></div>;

const Pocetna = () => {
    const navigate = useNavigate();

    return (
        <div className="pocetna-wrapper">
            <main className="pocetna-page">
                {/* HERO — NEMA AnimateOnScroll niti Suspense, mora biti odmah vidljiv */}
                <Hero navigate={navigate} />

                {/* SVE ISPOD HERO BLOKA UHVATIĆE SUSPENSE */}
                <Suspense fallback={<SectionLoader />}>
                    <ONama navigate={navigate} />
                    <Rezultati navigate={navigate} />
                    {/* REZULTATI - Sadrze sopstvene scroll pins i triggere, pa nema wrapper */}
                    <Program navigate={navigate} />
                    <Proces navigate={navigate} />

                    <CTA navigate={navigate} />
                    <Jedan navigate={navigate} />

                    {/* Ako ih vratiš, koristi ih ovako: */}
                    {/* <AnimateOnScroll>
                        <Motion navigate={navigate} />
                    </AnimateOnScroll>
                    */}
                </Suspense>
            </main>
        </div>
    );
};

export default Pocetna;