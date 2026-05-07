import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Real email/password login
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
      // Tell AppContext to load data — no page reload needed
      window.dispatchEvent(new Event('lbs-login'));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }, []);

  // Quick login — logs in via backend so real data loads
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
      window.dispatchEvent(new Event('lbs-login'));
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
