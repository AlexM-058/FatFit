import { useAuthStore } from '../stores/authStore';
import { getToken } from './jwt';
import { toast } from 'react-toastify';

export const httpRequest = async (url, options = {}, undefinedContentType = false) => {
    try {
        const headers = {
            ...options.headers,
        };
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Nu adăuga Content-Type la GET
        if (!undefinedContentType && (!options.method || options.method.toUpperCase() !== 'GET')) {
            headers['Content-Type'] = (options && options.headers && options.headers['Content-Type']) || 'application/json';
        }

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: "include", // important pentru cookie JWT cross-origin
        });

        const repClone = response.clone();

        if (repClone.status === 401 || repClone.status === 403) {
            let json = {};
            try {
                json = await repClone.json();
            } catch (e) {
                console.warn('Failed to parse JSON from response:', e);
                // ignore parse error
            }
            if (json.message === 'Token expired') {
                handleTokenExpired();
                return Promise.reject('Token has expired');
            }
        }

        return response;
    } catch (err) {
        console.error('HTTP Request failed: ', err);
        throw err;
    }
};

const handleTokenExpired = () => {
    // Call logout function from auth store
    const logout = useAuthStore.getState().logout;
    if (typeof logout === 'function') {
        logout();
    }

    toast.error('Your session has expired. You will be redirected to the login page.');

    setTimeout(() => {
        window.location.reload();
    }, 3000); // 3 secunde timeout default
};
