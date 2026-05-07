const router           = require('express').Router();
const EquipmentRequest = require('../models/EquipmentRequest');
const Notification     = require('../models/Notification');
const auth             = require('../middleware/auth');

router.use(auth);

// GET /api/equipment-requests
router.get('/', async (req, res) => {
  try {
    const { role, id } = req.user;
    const query =
      role === 'admin'  ? {} :
      role === 'staff'  ? { staffId: id } :
                          { facultyId: id };
    const requests = await EquipmentRequest.find(query, { __v: 0 });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/equipment-requests
router.post('/', async (req, res) => {
  try {
    const { facultyId, facultyName, venueId, venueName, staffId, items, date, timeSlot } = req.body;
    if (!venueId || !items || items.length === 0)
      return res.status(400).json({ error: 'venueId and items are required' });

    const eReq = await new EquipmentRequest({
      id:          'er' + Date.now(),
      facultyId,   facultyName,
      venueId,     venueName,
      staffId:     staffId || '',
      items,       date,  timeSlot,
      status:      'pending',
      notes:       '',
      createdAt:   new Date().toISOString(),
    }).save();

    if (staffId) {
      await new Notification({
        id:        'n' + Date.now(),
        userId:    staffId,
        title:     'Equipment Request',
        message:   `${facultyName} needs equipment setup in ${venueName} on ${date}.`,
        type:      'equipment',
        read:      false,
        createdAt: new Date().toISOString(),
      }).save();
    }

    res.status(201).json(eReq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/equipment-requests/:id
router.put('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const eReq = await EquipmentRequest.findOne({ id: req.params.id });
    if (!eReq) return res.status(404).json({ error: 'Equipment request not found' });

    eReq.status = status;
    if (notes !== undefined) eReq.notes = notes;
    await eReq.save();

    const statusMsg = {
      acknowledged: 'acknowledged your equipment request',
      ready:        'marked your equipment as ready',
    };
    if (statusMsg[status]) {
      await new Notification({
        id:        'n' + Date.now(),
        userId:    eReq.facultyId,
        title:     'Equipment Update',
        message:   `Support staff has ${statusMsg[status]} for ${eReq.venueName} on ${eReq.date}.`,
        type:      'equipment',
        read:      false,
        createdAt: new Date().toISOString(),
      }).save();
    }

    res.json(eReq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
