// src/login/api.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true,  // OBAVEZNO: šalje HttpOnly cookies sa svakim requestom
});

// =============================================
// Request interceptor — dodaje access token
// =============================================
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// =============================================
// Response interceptor — automatski refresh kad access token istekne
// =============================================
let isRefreshing = false;
let failedQueue = [];

/**
 * Kad istekne access token, više zahteva može pasti istovremeno.
 * Ovaj mehanizam stavlja ih u red čekanja dok se refresh ne završi,
 * pa ih sve ponovo šalje sa novim tokenom.
 */
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Ako je 401 i razlog je TOKEN_EXPIRED (ne TOKEN_INVALID)
        // i nije retry (sprečavamo beskonačnu petlju)
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === 'TOKEN_EXPIRED' &&
            !originalRequest._retry
        ) {
            // Ako je refresh već u toku, stavi u red čekanja
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Pozovi /refresh endpoint — browser automatski šalje refreshToken cookie
                const { data } = await axios.post(
                    `${apiUrl}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = data.accessToken;
                localStorage.setItem('token', newAccessToken);

                // Ažuriraj korisnika u localStorage ako je server poslao svežeg
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // Pusti sve zahteve iz reda čekanja
                processQueue(null, newAccessToken);

                // Ponovi originalni zahtev sa novim tokenom
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh je propao — sesija je potpuno istekla
                processQueue(refreshError, null);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;