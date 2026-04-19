const router       = require('express').Router();
const Booking      = require('../models/Booking');
const Notification = require('../models/Notification');
const Venue        = require('../models/Venue');
const auth         = require('../middleware/auth');

router.use(auth);

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find({}, { __v: 0 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/bookings — instantly confirmed
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

    // Save booking to MongoDB
    const booking = await new Booking({
      id: 'b' + Date.now(),
      venueId, venueName, facultyId, facultyName,
      date, timeSlotId, timeSlotLabel: timeSlotLabel || '',
      purpose, notes: notes || '',
      equipmentNeeded: equipmentNeeded || [],
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }).save();

    // Notify assigned staff
    const venue = await Venue.findOne({ id: venueId });
    if (venue?.assignedStaff) {
      await new Notification({
        id: 'n' + Date.now(),
        userId: venue.assignedStaff,
        title: 'New Venue Booking',
        message: `${facultyName} has booked ${venueName} on ${date} at ${timeSlotLabel}.`,
        type: 'booking', read: false,
        createdAt: new Date().toISOString(),
      }).save();
    }

    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({ id: req.params.id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.facultyId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/bookings/:id/approve
router.put('/:id/approve', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id }, { status: 'confirmed' }, { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/bookings/:id/reject
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id },
      { status: 'rejected', notes: reason || '' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
