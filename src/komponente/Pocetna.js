import React, { Suspense, lazy, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Pocetna.css';

// HERO SE UČITAVA ODMAH (EAGER)
import Hero from '../pocetna/Hero';

// OSTALE SEKCIJE SE UČITAVAJU NAKNADNO (LAZY)
const ONama = lazy(() => import('../pocetna/ONama'));
const Program = lazy(() => import('../pocetna/Program'));
const Rezultati = lazy(() => import('../pocetna/Rezultati'));
const Proces = lazy(() => import('../pocetna/Proces'));
const CTA = lazy(() => import('../pocetna/CTA'));
const Jedan = lazy(() => import('../pocetna/Jedan'));
const Konsultacije = lazy(() => import('../pocetna/Konsultacije'));
const BlogPreview = lazy(() => import('../pocetna/BlogPreview'));

// Fallback skeleton ili prazan div za glatko iskustvo skrolovanja
const SectionLoader = () => <div style={{ height: '50vh' }}></div>;

const Pocetna = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');

            // Wait slightly for any lazy-loading to finish or mount
            const timeoutId = setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [location]);

    return (
        <div className="pocetna-wrapper">
            <main className="pocetna-page">
                <Hero navigate={navigate} />

                <Suspense fallback={<SectionLoader />}>
                    <ONama navigate={navigate} />
                    <Rezultati navigate={navigate} />
                    <Program navigate={navigate} />
                    <Proces navigate={navigate} />
                    <Konsultacije navigate={navigate} />
                    <Jedan navigate={navigate} />
                    <BlogPreview navigate={navigate} />
                    <CTA navigate={navigate} />
                </Suspense>
            </main>
        </div>
    );
};

export default Pocetna;