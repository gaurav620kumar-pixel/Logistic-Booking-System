import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  mockBookings as initialBookings,
  mockVenues as initialVenues,
  mockUsers as initialUsers,
  mockNotifications as initialNotifications,
  mockEquipmentRequests as initialEquipmentRequests,
  mockCompromiseRequests as initialCompromiseRequests,
} from '@/data/mockData';
import { api } from '@/lib/api';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [bookings, setBookings]                     = useState(initialBookings);
  const [venues, setVenues]                         = useState(initialVenues);
  const [users, setUsers]                           = useState(initialUsers);
  const [notifications, setNotifications]           = useState(initialNotifications);
  const [equipmentRequests, setEquipmentRequests]   = useState(initialEquipmentRequests);
  const [compromiseRequests, setCompromiseRequests] = useState(initialCompromiseRequests);

  // Try to load real data from backend.
  // If the token is missing or backend is down, mock data stays — UI never breaks.
  useEffect(() => {
    // Always try to load real data if backend is available.
    // Falls back to mock data silently if token missing or backend is down.
    const loadData = async () => {
      try {
        const [v, b, n, er, cr, u] = await Promise.all([
          api.get('/venues'),
          api.get('/bookings'),
          api.get('/notifications'),
          api.get('/equipment-requests'),
          api.get('/compromise-requests'),
          api.get('/users'),
        ]);
        setVenues(v);
        setBookings(b);
        setNotifications(n);
        setEquipmentRequests(er);
        setCompromiseRequests(cr);
        setUsers(u);
      } catch (err) {
        console.warn('Backend unavailable, using mock data:', err.message);
      }
    };

    loadData();
  }, []);

  // ── Bookings ─────────────────────────────────────────────
  const approveBooking = useCallback(async (bookingId) => {
    try {
      const updated = await api.put(`/bookings/${bookingId}/approve`, {});
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    } catch {
      // fallback: update locally
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'approved' } : b));
    }
  }, []);

  const rejectBooking = useCallback(async (bookingId, reason = '') => {
    try {
      const updated = await api.put(`/bookings/${bookingId}/reject`, { reason });
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    } catch {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'rejected', notes: reason } : b));
    }
  }, []);

  const createBooking = useCallback(async (data) => {
    try {
      const newBooking = await api.post('/bookings', data);
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch {
      const newBooking = { ...data, id: 'b' + Date.now(), status: 'pending', createdAt: new Date().toISOString() };
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    }
  }, []);

  // ── Venues ───────────────────────────────────────────────
  const addVenue = useCallback(async (data) => {
    try {
      const newVenue = await api.post('/venues', data);
      setVenues(prev => [...prev, newVenue]);
    } catch {
      const newVenue = { ...data, id: 'v' + Date.now(), status: data.status || 'available' };
      setVenues(prev => [...prev, newVenue]);
    }
  }, []);

  const updateVenue = useCallback(async (venueId, data) => {
    try {
      const updated = await api.put(`/venues/${venueId}`, data);
      setVenues(prev => prev.map(v => v.id === venueId ? updated : v));
    } catch {
      setVenues(prev => prev.map(v => v.id === venueId ? { ...v, ...data } : v));
    }
  }, []);

  const deleteVenue = useCallback(async (venueId) => {
    try {
      await api.delete(`/venues/${venueId}`);
    } catch {}
    setVenues(prev => prev.filter(v => v.id !== venueId));
  }, []);

  const getVenueStatus = useCallback((venueId) => {
    const venue = venues.find(v => v.id === venueId);
    return venue ? venue.status : 'available';
  }, [venues]);

  // ── Users ────────────────────────────────────────────────
  const addUser = useCallback(async (data) => {
    try {
      const newUser = await api.post('/users', data);
      setUsers(prev => [...prev, newUser]);
    } catch {
      setUsers(prev => [...prev, { ...data, id: 'u' + Date.now() }]);
    }
  }, []);

  const updateUser = useCallback(async (userId, data) => {
    try {
      const updated = await api.put(`/users/${userId}`, data);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    } catch {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
    } catch {}
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  // ── Notifications ────────────────────────────────────────
  const addNotification = useCallback(async (data) => {
    const n = { id: 'n' + Date.now(), read: false, createdAt: new Date().toISOString(), ...data };
    try {
      const created = await api.post('/notifications', data);
      setNotifications(prev => [created, ...prev]);
    } catch {
      setNotifications(prev => [n, ...prev]);
    }
  }, []);

  const markNotificationRead = useCallback(async (notifId) => {
    try { await api.put(`/notifications/${notifId}/read`, {}); } catch {}
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(async (userId) => {
    try { await api.put('/notifications/read-all', {}); } catch {}
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
  }, []);

  // ── Equipment Requests ───────────────────────────────────
  const createEquipmentRequest = useCallback(async (data) => {
    try {
      const req = await api.post('/equipment-requests', data);
      setEquipmentRequests(prev => [req, ...prev]);
      return req;
    } catch {
      const req = { ...data, id: 'er' + Date.now(), status: 'pending', createdAt: new Date().toISOString() };
      setEquipmentRequests(prev => [req, ...prev]);
      return req;
    }
  }, []);

  const updateEquipmentRequest = useCallback(async (reqId, status, notes = '') => {
    try {
      const updated = await api.put(`/equipment-requests/${reqId}`, { status, notes });
      setEquipmentRequests(prev => prev.map(r => r.id === reqId ? updated : r));
    } catch {
      setEquipmentRequests(prev => prev.map(r => r.id === reqId ? { ...r, status, notes } : r));
    }
  }, []);

  // ── Compromise Requests ──────────────────────────────────
  const createCompromiseRequest = useCallback(async (data) => {
    try {
      const req = await api.post('/compromise-requests', data);
      setCompromiseRequests(prev => [req, ...prev]);
      return req;
    } catch {
      const req = { ...data, id: 'cr' + Date.now(), status: 'pending', createdAt: new Date().toISOString() };
      setCompromiseRequests(prev => [req, ...prev]);
      return req;
    }
  }, []);

  const respondCompromiseRequest = useCallback(async (reqId, status) => {
    try {
      const updated = await api.put(`/compromise-requests/${reqId}`, { status });
      setCompromiseRequests(prev => prev.map(r => r.id === reqId ? updated : r));
    } catch {
      setCompromiseRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
    }
  }, []);

  return (
    <AppContext.Provider value={{
      bookings, venues, users, notifications, equipmentRequests, compromiseRequests,
      approveBooking, rejectBooking, createBooking,
      addVenue, updateVenue, deleteVenue, getVenueStatus,
      addUser, updateUser, deleteUser,
      addNotification, markNotificationRead, markAllRead,
      createEquipmentRequest, updateEquipmentRequest,
      createCompromiseRequest, respondCompromiseRequest,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
