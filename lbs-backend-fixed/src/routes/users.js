const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/users  (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users.map(u => u.toObject()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users  (admin only - add new user)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, department, role } = req.body;
    if (!name || !email || !department || !role)
      return res.status(400).json({ error: 'Name, email, department and role are required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: 'A user with this email already exists' });

    const newUser = new User({
      id: 'u' + Date.now(),
      name, email,
      phone: phone || '',
      department, role,
      password: bcrypt.hashSync('college@123', 10),
    });
    await newUser.save();

    const { password, ...safe } = newUser.toObject();
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id  (admin only - update user)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, department, role } = req.body;
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    Object.assign(user, { name, email, phone, department, role });
    await user.save();

    const { password, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id  (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
