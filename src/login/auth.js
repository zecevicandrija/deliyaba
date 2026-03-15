import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import {
  MDBModal,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
} from "mdb-react-ui-kit";

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      // Pozovi backend da obriše refresh token iz baze i cookie-ja
      await api.post('/api/auth/logout');
    } catch (error) {
      // Čak i ako server nije dostupan, nastavljamo sa lokalnom odjavom
      console.error("Greška prilikom odjave sa servera:", error);
    }
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const verifyUserSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          const freshUser = response.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          // api.js interceptor će automatski pokušati refresh ako je TOKEN_EXPIRED
          // Ako i refresh propadne, interceptor će redirect-ovati na /login
          // Ovde stižemo samo ako je i refresh propao
          console.error("Sesija nije validna, odjavljivanje:", error);
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    // OPTIMIZACIJA: Throttle — max 1 poziv na 30 sekundi pri focus eventu
    let lastFocusCheck = 0;
    const throttledVerify = () => {
      const now = Date.now();
      if (now - lastFocusCheck > 30000) {
        lastFocusCheck = now;
        verifyUserSession();
      }
    };

    verifyUserSession();
    window.addEventListener('focus', throttledVerify);
    return () => {
      window.removeEventListener('focus', throttledVerify);
    };
  }, [logout]);

  const login = async (email, sifra) => {
    try {
      const response = await api.post("/api/auth/login", { email, sifra });
      if (response.status === 200) {
        const { user: loggedInUser, accessToken } = response.data;
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        localStorage.setItem("token", accessToken);
        // Refresh token je automatski čuvan kao HttpOnly cookie od strane servera
        navigate("/");
      }
    } catch (error) {
      setModalMessage("Došlo je do greške prilikom prijave. Proverite kredencijale.");
      setShowModal(true);
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const updateUser = async (userData) => { /* ... */ };

  const value = React.useMemo(
    () => ({ user, setUser, loading, login, logout, updateUser }),
    [user, loading, logout]
  );

  return (
    <>
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
      <MDBModal show={showModal} tabIndex="-1" centered>
        {/* ... ostatak modala ... */}
      </MDBModal>
    </>
  );
};

export const useAuth = () => useContext(AuthContext);