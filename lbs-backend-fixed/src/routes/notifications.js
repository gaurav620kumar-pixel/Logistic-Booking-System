const router = require('express').Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/notifications  (returns notifications for the logged-in user)
router.get('/', async (req, res) => {
  try {
    const { id, role } = req.user;
    const query = role === 'admin' ? {} : { userId: id };
    const notifications = await Notification.find(query, { _id: 0, __v: 0 }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read  (mark single notification as read)
router.put('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { id: req.params.id },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json(notif.toObject({ versionKey: false }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/mark-all-read  (mark all as read for current user)
router.put('/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
