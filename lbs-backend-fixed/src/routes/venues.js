const router = require('express').Router();
const Venue = require('../models/Venue');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/venues
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find({}, { _id: 0, __v: 0 });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/venues/:id/status
router.get('/:id/status', async (req, res) => {
  try {
    const venue = await Venue.findOne({ id: req.params.id });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json({ status: venue.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/venues  (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, type, capacity, building, floor, status, equipment, assignedStaff } = req.body;
    if (!name || !building || !capacity)
      return res.status(400).json({ error: 'Name, building and capacity are required' });

    const newVenue = new Venue({
      id: 'v' + Date.now(),
      name,
      type: type || 'classroom',
      capacity: parseInt(capacity) || 0,
      building,
      floor: parseInt(floor) || 0,
      status: status || 'available',
      equipment: equipment || [],
      assignedStaff: assignedStaff || '',
    });
    await newVenue.save();
    res.status(201).json(newVenue.toObject({ versionKey: false }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/venues/:id
router.put('/:id', async (req, res) => {
  try {
    const venue = await Venue.findOne({ id: req.params.id });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });

    const fields = ['name', 'type', 'capacity', 'building', 'floor', 'status', 'equipment', 'assignedStaff'];
    fields.forEach(f => { if (req.body[f] !== undefined) venue[f] = req.body[f]; });
    await venue.save();

    res.json(venue.toObject({ versionKey: false }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/venues/:id
router.delete('/:id', async (req, res) => {
  try {
    const venue = await Venue.findOneAndDelete({ id: req.params.id });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
