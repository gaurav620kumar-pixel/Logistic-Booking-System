const router = require('express').Router();
const Venue  = require('../models/Venue');
const auth   = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find({}, { __v: 0 });
    res.json(venues);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/status', async (req, res) => {
  try {
    const venue = await Venue.findOne({ id: req.params.id });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json({ status: venue.status });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, capacity, building, floor, status, equipment, assignedStaff } = req.body;
    if (!name || !building || !capacity)
      return res.status(400).json({ error: 'Name, building and capacity are required' });

    const venue = await new Venue({
      id: 'v' + Date.now(), name,
      type: type || 'classroom',
      capacity: parseInt(capacity) || 0,
      building, floor: parseInt(floor) || 0,
      status: status || 'available',
      equipment: equipment || [],
      assignedStaff: assignedStaff || '',
    }).save();
    res.status(201).json(venue);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const fields = ['name','type','capacity','building','floor','status','equipment','assignedStaff'];
    const updates = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const venue = await Venue.findOneAndUpdate({ id: req.params.id }, updates, { new: true, projection: { __v: 0 } });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json(venue);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const venue = await Venue.findOneAndDelete({ id: req.params.id });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
