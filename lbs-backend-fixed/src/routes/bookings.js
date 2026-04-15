const router = require('express').Router();
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/bookings  (admin gets all, faculty/staff gets own)
router.get('/', async (req, res) => {
  try {
    const { role, id } = req.user;
    const query = role === 'admin' ? {} : { facultyId: id };
    const bookings = await Booking.find(query, { _id: 0, __v: 0 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/check-conflict
router.get('/check-conflict', async (req, res) => {
  try {
    const { venueId, date, timeSlotId } = req.query;
    const conflict = await Booking.findOne({
      venueId, date, timeSlotId,
      status: { $nin: ['rejected', 'cancelled'] },
    });
    res.json({ hasConflict: !!conflict });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const {
      venueId, venueName, facultyId, facultyName,
      date, timeSlotId, timeSlotLabel, purpose, notes, equipmentNeeded,
    } = req.body;

    if (!venueId || !date || !timeSlotId || !purpose)
      return res.status(400).json({ error: 'venueId, date, timeSlotId and purpose are required' });

    // Conflict check
    const conflict = await Booking.findOne({
      venueId, date, timeSlotId,
      status: { $nin: ['rejected', 'cancelled'] },
    });
    if (conflict)
      return res.status(409).json({ error: 'This venue slot is already booked' });

    const newBooking = new Booking({
      id: 'b' + Date.now(),
      venueId, venueName, facultyId, facultyName,
      date, timeSlotId, timeSlotLabel,
      purpose,
      notes: notes || '',
      equipmentNeeded: equipmentNeeded || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    await newBooking.save();

    // Notify admin
    const admin = await User.findOne({ role: 'admin' });
    await new Notification({
      id: 'n' + Date.now(),
      userId: admin?.id || 'a1',
      title: 'New Booking Request',
      message: `${facultyName} requests ${venueName} on ${date}.`,
      type: 'booking',
      read: false,
      createdAt: new Date().toISOString(),
    }).save();

    res.status(201).json(newBooking.toObject({ versionKey: false }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:id/approve
router.put('/:id/approve', async (req, res) => {
  try {
    const booking = await Booking.findOne({ id: req.params.id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'approved';
    await booking.save();

    await new Notification({
      id: 'n' + Date.now(),
      userId: booking.facultyId,
      title: 'Booking Approved',
      message: `Your booking for ${booking.venueName} on ${booking.date} has been approved.`,
      type: 'booking',
      read: false,
      createdAt: new Date().toISOString(),
    }).save();

    res.json(booking.toObject({ versionKey: false }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:id/reject
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findOne({ id: req.params.id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'rejected';
    if (reason) booking.notes = reason;
    await booking.save();

    await new Notification({
      id: 'n' + Date.now(),
      userId: booking.facultyId,
      title: 'Booking Rejected',
      message: `Your booking for ${booking.venueName} on ${booking.date} has been rejected.${reason ? ' Reason: ' + reason : ''}`,
      type: 'cancellation',
      read: false,
      createdAt: new Date().toISOString(),
    }).save();

    res.json(booking.toObject({ versionKey: false }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
