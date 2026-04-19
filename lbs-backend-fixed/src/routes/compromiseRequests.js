const router           = require('express').Router();
const CompromiseRequest = require('../models/CompromiseRequest');
const Booking          = require('../models/Booking');
const Notification     = require('../models/Notification');
const auth             = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { id, role } = req.user;
    const query = role === 'admin' ? {} : { $or: [{ fromFacultyId: id }, { toFacultyId: id }] };
    const requests = await CompromiseRequest.find(query, { __v: 0 });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { fromFacultyId, fromFacultyName, toFacultyId, toFacultyName,
            bookingId, venueId, venueName, date, timeSlot, timeSlotId, reason } = req.body;

    if (!fromFacultyId || !toFacultyId || !reason)
      return res.status(400).json({ error: 'fromFacultyId, toFacultyId and reason are required' });

    const cReq = await new CompromiseRequest({
      id: 'cr' + Date.now(),
      fromFacultyId, fromFacultyName,
      toFacultyId, toFacultyName,
      bookingId, venueId, venueName,
      date, timeSlot, timeSlotId, reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }).save();

    await new Notification({
      id: 'n' + Date.now(),
      userId: toFacultyId,
      title: 'Slot Transfer Request',
      message: `${fromFacultyName} is requesting your slot at ${venueName} on ${date} (${timeSlot}). Reason: ${reason}`,
      type: 'request', read: false,
      createdAt: new Date().toISOString(),
    }).save();

    res.status(201).json(cReq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status))
      return res.status(400).json({ error: 'Status must be accepted or declined' });

    const cReq = await CompromiseRequest.findOne({ id: req.params.id });
    if (!cReq) return res.status(404).json({ error: 'Request not found' });

    cReq.status = status;
    await cReq.save();

    if (status === 'accepted') {
      // Cancel original booking
      const original = await Booking.findOneAndUpdate(
        { id: cReq.bookingId }, { status: 'cancelled' }, { new: true }
      );

      // Create new booking for requesting faculty
      await new Booking({
        id: 'b' + Date.now(),
        venueId:        cReq.venueId || original?.venueId,
        venueName:      cReq.venueName || original?.venueName,
        facultyId:      cReq.fromFacultyId,
        facultyName:    cReq.fromFacultyName,
        date:           cReq.date,
        timeSlotId:     cReq.timeSlotId || original?.timeSlotId,
        timeSlotLabel:  cReq.timeSlot || original?.timeSlotLabel,
        purpose:        `Transferred from ${cReq.toFacultyName}`,
        notes:          `Original request reason: ${cReq.reason}`,
        equipmentNeeded: original?.equipmentNeeded || [],
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      }).save();

      const now = Date.now();
      await Notification.insertMany([
        {
          id: 'n' + now,
          userId: cReq.fromFacultyId,
          title: 'Slot Transfer Accepted!',
          message: `${cReq.toFacultyName} accepted your request. ${cReq.venueName} on ${cReq.date} (${cReq.timeSlot}) is now booked for you.`,
          type: 'booking', read: false, createdAt: new Date().toISOString(),
        },
        {
          id: 'n' + (now + 1),
          userId: cReq.toFacultyId,
          title: 'Slot Transferred',
          message: `You transferred ${cReq.venueName} on ${cReq.date} (${cReq.timeSlot}) to ${cReq.fromFacultyName}.`,
          type: 'cancellation', read: false, createdAt: new Date().toISOString(),
        },
      ]);
    } else {
      await new Notification({
        id: 'n' + Date.now(),
        userId: cReq.fromFacultyId,
        title: 'Slot Request Declined',
        message: `${cReq.toFacultyName} declined your request for ${cReq.venueName} on ${cReq.date} (${cReq.timeSlot}).`,
        type: 'cancellation', read: false,
        createdAt: new Date().toISOString(),
      }).save();
    }

    res.json(cReq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
