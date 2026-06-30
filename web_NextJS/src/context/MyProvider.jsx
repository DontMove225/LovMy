'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import axios from 'axios';

export const MyContext = createContext({});

export function MyProvider({ children }) {
  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.fr/api/';
  const imageBaseURL = process.env.NEXT_PUBLIC_IMAGE_URL || 'https://lovmy.fr/';
  const paymentBaseURL = process.env.NEXT_PUBLIC_PAYMENT_URL || 'https://lovmy.fr/';

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const getStoredUser = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('Register_User') || 'null');
    } catch {
      return null;
    }
  }, []);

  const getStoredToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  const apiPost = useCallback(async (endpoint, data = {}) => {
    const storedToken = getStoredToken();
    const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
    const response = await axios.post(`${basUrl}${endpoint}`, data, { headers });
    return response.data;
  }, [basUrl, getStoredToken]);

  const apiGet = useCallback(async (endpoint) => {
    const storedToken = getStoredToken();
    const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
    const response = await axios.get(`${basUrl}${endpoint}`, { headers });
    return response.data;
  }, [basUrl, getStoredToken]);

  const login = useCallback((userData, authToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authToken);
      localStorage.setItem('UserId', userData.id ?? '');
      localStorage.setItem('Register_User', JSON.stringify(userData));
    }
    setUser(userData);
    setToken(authToken);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('UserId');
      localStorage.removeItem('Register_User');
    }
    setUser(null);
    setToken(null);
  }, []);

  return (
    <MyContext.Provider
      value={{
        basUrl,
        imageBaseURL,
        paymentBaseURL,
        user,
        setUser,
        token,
        login,
        logout,
        apiPost,
        apiGet,
        getStoredUser,
        getStoredToken,
      }}
    >
      {children}
    </MyContext.Provider>
  );
}

export function useApp() {
  return useContext(MyContext);
}
