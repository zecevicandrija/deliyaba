'use client';

import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../login/auth';
import './Navbar.css';
import { ThemeContext } from '../komponente/ThemeContext';
import deliyaLogo from '../images/deliyalogos/White_AC.png';
import { FiUser, FiBarChart2, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
    const { user, loading } = useAuth();
    const { isDarkTheme } = useContext(ThemeContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const closeMobileMenu = () => setIsMenuOpen(false);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
            <div className="navbar-container">

                {/* LEFT — Logo */}
                <div className="navbar-brand">
                    <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                        <img src={deliyaLogo} alt="Deliya Barber Academy" className="logo-img" width="169" height="70" />
                    </Link>
                </div>

                {/* CENTER — Nav links */}
                <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li className="navbar-item">
                        <Link to="/" className="navbar-link" onClick={closeMobileMenu}>Početna</Link>
                    </li>
                    <li className="navbar-item">
                        <a href="https://onelink.to/delija-the-barbe" target="_blank" rel="noopener noreferrer" className="navbar-link" onClick={closeMobileMenu}>Zakaži Termin</a>
                    </li>

                    {!loading && user && (
                        <>
                            <li className="navbar-item">
                                <Link to="/" className="navbar-link" onClick={closeMobileMenu}>Lekcije</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/profil" className="navbar-link icon-link" onClick={closeMobileMenu}>
                                    <FiUser />
                                    <span className="icon-text">Profil</span>
                                </Link>
                            </li>
                            {(user.uloga === 'admin' || user.uloga === 'instruktor') && (
                                <li className="navbar-item">
                                    <Link to="/instruktor" className="navbar-link icon-link" onClick={closeMobileMenu}>
                                        <FiBarChart2 />
                                        <span className="icon-text">Dashboard</span>
                                    </Link>
                                </li>
                            )}
                        </>
                    )}

                    {/* Mobile-only: Prijava link inside overlay */}
                    {!loading && !user && (
                        <li className="navbar-item mobile-only">
                            <Link to="/login" className="navbar-link" onClick={closeMobileMenu}>Prijava</Link>
                        </li>
                    )}

                    {/* Mobile-only: CTA Upis button inside overlay */}
                    {!loading && !user && (
                        <li className="navbar-item mobile-only">
                            <div className="mobile-cta-wrapper">
                                <Link to="/" className="mobile-cta-btn" onClick={closeMobileMenu}>
                                    Upis na Akademiju
                                </Link>
                            </div>
                        </li>
                    )}
                </ul>

                {/* RIGHT — CTA + Hamburger */}
                <div className="navbar-actions">
                    {!loading && !user && (
                        <>
                            <Link to="/" className="navbar-link login-link" onClick={closeMobileMenu}>
                                Prijava
                            </Link>
                            <Link to="/paket" className="navbar-cta-btn" onClick={closeMobileMenu}>
                                Upis na Akademiju
                            </Link>
                        </>
                    )}

                    <button
                        className={`navbar-hamburger ${isMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsMenuOpen(prev => !prev)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;