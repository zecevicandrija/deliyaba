import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from './login/auth';
import { ThemeProvider } from './komponente/ThemeContext';
import Navbar from './Navigacija/Navbar';
import ProtectedRoute from './komponente/ProtectedRoutes'; // Ostavljamo eager zbog brze provere autorizacije
import './App.css';

import Pocetna from './komponente/Pocetna';
const KursLista = lazy(() => import('./komponente/KursLista'));
const DodajKurs = lazy(() => import('./komponente/DodajKurs'));
const LoginPage = lazy(() => import('./login/LoginPage'));
const DodajKorisnika = lazy(() => import('./login/DodajKorisnika'));
const Footer = lazy(() => import('./pocetna/Footer'));
const KursDetalj = lazy(() => import('./komponente/KursDetalj'));
const Lekcije = lazy(() => import('./komponente/Lekcije'));
const MojProfil = lazy(() => import('./login/MojProfil'));
const KupljenKurs = lazy(() => import('./komponente/KupljenKurs'));
const Instruktor = lazy(() => import('./Instruktori/Instruktor'));
const Editkorisnika = lazy(() => import('./Instruktori/Editkorisnika'));
const PopustDashboard = lazy(() => import('./Instruktori/PopustDashboard'));
const Nepostojeca = lazy(() => import('./komponente/Nepostojeca'));
const Studenti = lazy(() => import('./Instruktori/Studenti'));
const Korpa = lazy(() => import('./Kupovina/Korpa'));
const Kviz = lazy(() => import('./Instruktori/Kviz'));
const Checkout = lazy(() => import('./Kupovina/Checkout'));
const PaymentResult = lazy(() => import('./Kupovina/PaymentResult'));
const EditKursa = lazy(() => import('./Instruktori/EditKursa'));
const Statistika = lazy(() => import('./Instruktori/Statistika'));
const Paket = lazy(() => import('./komponente/Paket'));
const Produzivanje = lazy(() => import('./komponente/Produzivanje'));
const Informacije = lazy(() => import('./komponente/Informacije'));
const Tos = lazy(() => import('./komponente/Tos'));
const RefundPolicy = lazy(() => import('./komponente/RefundPolicy'));
const PrivacyPolicy = lazy(() => import('./komponente/PrivacyPolicy'));

// Kreiramo jednostavan loader komponentu (možeš ga zameniti svojim spinnerom)
const Loader = () => <div className="page-loader">Učitavanje...</div>;

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          {/* Navbar se učitava odmah */}
          <Navbar />
          
          {/* Suspense hvata sve lazy rute i renderuje loader dok se chunk ne skine */}
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Pocetna />} />
              <Route path="/kursevi" element={<KursLista />} />
              <Route path="/dodajkurs" element={<ProtectedRoute element={<DodajKurs />} allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dodajkorisnika" element={<ProtectedRoute element={<DodajKorisnika />} allowedRoles={['admin']} />} />
              <Route path="/edit-korisnika" element={<ProtectedRoute element={<Editkorisnika />} allowedRoles={['admin']} />} />
              <Route path="/popusti" element={<ProtectedRoute element={<PopustDashboard />} allowedRoles={['admin']} />} />
              <Route path="/kurs/:id" element={<KursDetalj />} />
              <Route path="/lekcije" element={<ProtectedRoute element={<Lekcije />} allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/profil" element={<MojProfil />} />
              <Route path="/kupljenkurs" element={<KupljenKurs />} />
              <Route path="/studenti/:kursId" element={<ProtectedRoute element={<Studenti />} allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/instruktor" element={<ProtectedRoute element={<Instruktor />} allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/korpa" element={<Korpa />} />
              <Route path="/napravikviz" element={<ProtectedRoute element={<Kviz />} allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/placanje/rezultat" element={<PaymentResult />} />
              <Route path="/edit-kurs/:kursId" element={<EditKursa allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/statistika/:kursId" element={<Statistika allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/paket" element={<Paket />} />
              <Route path="/produzivanje" element={<Produzivanje />} />
              <Route path="/informacije" element={<Informacije />} />
              <Route path="/tos" element={<Tos />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/nevazeca" element={<Nepostojeca />} />
            </Routes>
            <Footer />
          </Suspense>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;