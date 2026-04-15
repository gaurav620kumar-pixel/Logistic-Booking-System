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

  // Quick dev login — uses mock data. Uses real login API to get a token so backend saves work.
  const loginAs = useCallback(async (role) => {
    // Map role to seeded credentials (must match seed.js)
    // These match the seeded users in seed.js (password: college@123)
    const credentials = {
      admin:   { email: 'meena@college.edu',  password: 'college@123' },
      faculty: { email: 'priya@college.edu',  password: 'college@123' },
      staff:   { email: 'rajesh@college.edu', password: 'college@123' },
    };
    const creds = credentials[role];
    if (creds) {
      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(creds),
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          localStorage.setItem('lbs_token', data.token);
          localStorage.setItem('lbs_user', JSON.stringify(data.user));
          window.location.reload();
          return;
        }
      } catch {}
    }
    // Fallback: use mock data without token (bookings won't save to DB)
    const found = mockUsers.find(u => u.role === role);
    if (found) {
      setUser(found);
      localStorage.setItem('lbs_user', JSON.stringify(found));
      localStorage.removeItem('lbs_token');
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
