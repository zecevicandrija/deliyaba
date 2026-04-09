'use client';

import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../login/auth';
import './Navbar.css';
import { ThemeContext } from '../komponente/ThemeContext';

import { FiUser, FiBarChart2, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
    const { user, loading } = useAuth();
    const { isDarkTheme } = useContext(ThemeContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('BA');
    const location = useLocation();

    // Close dropdown on click outside or navigation
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [location]);

    // Close on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const closeMobileMenu = () => {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    return (
        <nav className={`navbar ${isMenuOpen ? 'menu-open' : ''}`}>
            <div className="navbar-container">

                {/* LEFT — Logo */}
                <div className="navbar-brand">
                    <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                        <img src="/White_AC.webp" alt="Deliya Barber Academy" className="logo-img" width="169" height="70" fetchPriority="high" />
                    </Link>
                </div>

                {/* CENTER — Nav links (Desktop: 4 visible + More) */}
                <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li className="navbar-item">
                        <Link to="/#hero" className="navbar-link" onClick={closeMobileMenu}>Početna</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/#onama" className="navbar-link" onClick={closeMobileMenu}>O nama</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/#program" className="navbar-link" onClick={closeMobileMenu}>Programi</Link>
                    </li>
                    <li className="navbar-item desktop-hidden">
                        <Link to="/blog" className="navbar-link" onClick={closeMobileMenu}>Žurnal</Link>
                    </li>
                    <li className="navbar-item desktop-hidden">
                        <Link to="/#rezultati" className="navbar-link" onClick={closeMobileMenu}>Rezultati</Link>
                    </li>

                    {/* HIDDEN ON DESKTOP — Shown directly on mobile menu */}
                    <li className="navbar-item desktop-hidden">
                        <Link to="/#proces" className="navbar-link" onClick={closeMobileMenu}>Sistem Rada</Link>
                    </li>
                    <li className="navbar-item desktop-hidden">
                        <Link to="/#jedan" className="navbar-link" onClick={closeMobileMenu}>1:1 Mentorstvo</Link>
                    </li>
                    <li className="navbar-item desktop-hidden">
                        <Link to="/#konsultacije" className="navbar-link" onClick={closeMobileMenu}>Konsultacije</Link>
                    </li>

                    {/* DESKTOP DROPDOWN FOR "MORE" */}
                    <li className="navbar-item desktop-only dropdown-container">
                        <button
                            className={`navbar-link dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            VIŠE <span className="dropdown-plus">+</span>
                        </button>
                        <div className={`nav-dropdown ${isDropdownOpen ? 'show' : ''}`}>
                            <Link to="/blog" className="dropdown-link" onClick={closeMobileMenu}>Žurnal</Link>
                            <Link to="/#rezultati" className="dropdown-link" onClick={closeMobileMenu}>Rezultati</Link>
                            <Link to="/#proces" className="dropdown-link" onClick={closeMobileMenu}>Sistem Rada</Link>
                            <Link to="/#jedan" className="dropdown-link" onClick={closeMobileMenu}>1:1 Mentorstvo</Link>
                            <Link to="/#konsultacije" className="dropdown-link" onClick={closeMobileMenu}>Konsultacije</Link>
                        </div>
                    </li>

                    {/* ZAKAŽI TERMIN — Visible everywhere in the menu */}
                    <li className="navbar-item">
                        <a href="https://onelink.to/delija-the-barbe" target="_blank" rel="noopener noreferrer" className="navbar-link highlight" onClick={closeMobileMenu}>Zakaži Termin</a>
                    </li>

                    {!loading && user && (
                        <>
                            <li className="navbar-item">
                                <Link to="/kupljenkurs" className="navbar-link" onClick={closeMobileMenu}>Lekcije</Link>
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

                    {/* Mobile-only section bottom: Prijava & CTA */}
                    {!loading && !user && (
                        <li className="navbar-item mobile-only">
                            <div className="mobile-cta-wrapper">
                                <Link to="/login" className="mobile-secondary-btn" onClick={closeMobileMenu}>Prijava</Link>
                                <Link to="/paket" className="mobile-cta-btn" onClick={closeMobileMenu}>Upis na Akademiju</Link>
                            </div>
                        </li>
                    )}
                </ul>

                {/* RIGHT — Actions */}
                <div className="navbar-actions">
                    {!loading && !user && (
                        <div className="desktop-only action-group">
                            <Link to="/login" className="navbar-link login-link" onClick={closeMobileMenu}>
                                Prijava
                            </Link>
                            <Link to="/paket" className="navbar-cta-btn" onClick={closeMobileMenu}>
                                Upis na Akademiju
                            </Link>
                        </div>
                    )}

                    {/* Language Switcher */}
                    <div className="navbar-lang-switcher">
                        <button
                            className={`lang-btn ${currentLang === 'EN' ? 'active' : ''}`}
                            onClick={() => setCurrentLang('EN')}
                        >EN</button>
                        <span className="lang-divider"></span>
                        <button
                            className={`lang-btn ${currentLang === 'BA' ? 'active' : ''}`}
                            onClick={() => setCurrentLang('BA')}
                        >BA</button>
                    </div>

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