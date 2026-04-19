import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

import { api } from '@/lib/api';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
const [bookings, setBookings] = useState([]);
const [venues, setVenues] = useState([]);
const [users, setUsers] = useState([]);
const [notifications, setNotifications] = useState([]);
const [equipmentRequests, setEquipmentRequests] = useState([]);
const [compromiseRequests, setCompromiseRequests] = useState([]);

  // Load real data from backend if token exists
const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem('lbs_token');
  if (!token) {
    setLoading(false);
    return;
  }
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
      console.warn('Failed to load data:', err.message);
    } finally {
      setLoading(false);
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
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
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

  // Instant booking — status is 'confirmed' immediately
const createBooking = useCallback(async (data) => {
  const newBooking = await api.post('/bookings', data);
  setBookings(prev => [newBooking, ...prev]);
  return newBooking;
}, []);
  // ── Venues ───────────────────────────────────────────────
  const addVenue = useCallback(async (data) => {
    try {
      const newVenue = await api.post('/venues', data);
      setVenues(prev => [...prev, newVenue]);
    } catch {
      setVenues(prev => [...prev, { ...data, id: 'v' + Date.now(), status: data.status || 'available' }]);
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
    try { await api.delete(`/venues/${venueId}`); } catch {}
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
    try { await api.delete(`/users/${userId}`); } catch {}
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

      // If accepted — update local booking state too (cancel old, add new)
      if (status === 'accepted') {
        const cReq = compromiseRequests.find(r => r.id === reqId);
        if (cReq) {
          // Cancel the original booking
          setBookings(prev => prev.map(b =>
            b.id === cReq.bookingId ? { ...b, status: 'cancelled' } : b
          ));
          // Add new confirmed booking for requesting faculty
          const newBooking = {
            id: 'b' + Date.now(),
            venueId:       cReq.venueId,
            venueName:     cReq.venueName,
            facultyId:     cReq.fromFacultyId,
            facultyName:   cReq.fromFacultyName,
            date:          cReq.date,
            timeSlotId:    cReq.timeSlotId,
            timeSlotLabel: cReq.timeSlot,
            purpose:       `Transferred from ${cReq.toFacultyName}`,
            notes:         `Request reason: ${cReq.reason}`,
            equipmentNeeded: [],
            status:        'confirmed',
            createdAt:     new Date().toISOString(),
          };
          setBookings(prev => [newBooking, ...prev]);
        }
      }
    } catch {
      setCompromiseRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
    }
  }, [compromiseRequests]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
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
