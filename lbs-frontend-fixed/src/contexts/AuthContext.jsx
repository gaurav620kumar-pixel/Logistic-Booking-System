import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mockUsers } from '@/data/mockData';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Restore session from localStorage on page refresh
  useEffect(() => {
    const stored = localStorage.getItem('lbs_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  // Real email/password login via backend
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return false;

      setUser(data.user);
      localStorage.setItem('lbs_token', data.token);
      localStorage.setItem('lbs_user', JSON.stringify(data.user));
       window.location.reload();
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }, []);

  // Quick dev login — uses mock data directly, no API call needed
 const loginAs = useCallback(async (role) => {
  const roleEmails = {
    admin:   'meena@college.edu',
    faculty: 'priya@college.edu',
    staff:   'rajesh@college.edu',
  };
  const email = roleEmails[role];
  if (!email) return;

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'college@123' }),
    });
    const data = await res.json();
    if (!res.ok) return;

    setUser(data.user);
    localStorage.setItem('lbs_token', data.token);
    localStorage.setItem('lbs_user', JSON.stringify(data.user));
    window.location.reload();
  } catch (err) {
    console.error('Quick login error:', err);
  }
}, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('lbs_token');
    localStorage.removeItem('lbs_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
