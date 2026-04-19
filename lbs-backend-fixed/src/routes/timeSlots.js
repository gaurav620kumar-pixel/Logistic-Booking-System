const router   = require('express').Router();
const TimeSlot = require('../models/TimeSlot');
const auth     = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const slots = await TimeSlot.find({}, { __v: 0 }).sort({ id: 1 });
    res.json(slots);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
