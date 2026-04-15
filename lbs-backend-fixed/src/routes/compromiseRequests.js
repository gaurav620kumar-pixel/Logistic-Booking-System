const router = require('express').Router();
const CompromiseRequest = require('../models/CompromiseRequest');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/compromise-requests
router.get('/', async (req, res) => {
  try {
    const { id, role } = req.user;
    const query = role === 'admin'
      ? {}
      : { $or: [{ fromFacultyId: id }, { toFacultyId: id }] };

    const requests = await CompromiseRequest.find(query, { _id: 0, __v: 0 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/compromise-requests
router.post('/', async (req, res) => {
  try {
    const {
      fromFacultyId, fromFacultyName,
      toFacultyId, toFacultyName,
      bookingId, venueName, date, timeSlot, reason,
    } = req.body;

    if (!fromFacultyId || !toFacultyId || !reason)
      return res.status(400).json({ error: 'fromFacultyId, toFacultyId and reason are required' });

    const newReq = new CompromiseRequest({
      id: 'cr' + Date.now(),
      fromFacultyId, fromFacultyName,
      toFacultyId, toFacultyName,
      bookingId: bookingId || '',
      venueName: venueName || '',
      date: date || '',
      timeSlot: timeSlot || '',
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    await newReq.save();

    // Notify target faculty
    await new Notification({
      id: 'n' + Date.now(),
      userId: toFacultyId,
      title: 'New Venue Request',
      message: `${fromFacultyName} has requested to use ${venueName} on ${date}.`,
      type: 'request',
      read: false,
      createdAt: new Date().toISOString(),
    }).save();

    res.status(201).json(newReq.toObject({ versionKey: false }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/compromise-requests/:id  (accept or decline)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status))
      return res.status(400).json({ error: 'Status must be accepted or declined' });

    const cReq = await CompromiseRequest.findOne({ id: req.params.id });
    if (!cReq) return res.status(404).json({ error: 'Compromise request not found' });

    cReq.status = status;
    await cReq.save();

    // Notify requesting faculty
    await new Notification({
      id: 'n' + Date.now(),
      userId: cReq.fromFacultyId,
      title: `Venue Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `${cReq.toFacultyName} has ${status} your venue request for ${cReq.venueName} on ${cReq.date}.`,
      type: 'request',
      read: false,
      createdAt: new Date().toISOString(),
    }).save();

    res.json(cReq.toObject({ versionKey: false }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
