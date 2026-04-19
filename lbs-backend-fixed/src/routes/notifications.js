const router       = require('express').Router();
const Notification = require('../models/Notification');
const auth         = require('../middleware/auth');

router.use(auth);

// GET /api/notifications — current user's only
router.get('/', async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user.id }, { __v: 0 }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notifications
router.post('/', async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    if (!userId || !title || !message)
      return res.status(400).json({ error: 'userId, title and message are required' });

    const notif = await new Notification({
      id: 'n' + Date.now(), userId, title, message,
      type: type || 'system', read: false,
      createdAt: new Date().toISOString(),
    }).save();
    res.status(201).json(notif);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/notifications/read-all  — MUST be before /:id/read
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate({ id: req.params.id }, { read: true });
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
