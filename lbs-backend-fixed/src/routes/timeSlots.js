const router = require('express').Router();
const TimeSlot = require('../models/TimeSlot');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/timeslots
router.get('/', async (req, res) => {
  try {
    const slots = await TimeSlot.find({}, { _id: 0, __v: 0 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
