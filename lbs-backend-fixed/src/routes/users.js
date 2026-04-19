const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const auth   = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, __v: 0 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, department, role } = req.body;
    if (!name || !email || !department || !role)
      return res.status(400).json({ error: 'Name, email, department and role are required' });

    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'A user with this email already exists' });

    const user = await new User({
      id: 'u' + Date.now(), name, email,
      phone: phone || '', department, role,
      password: bcrypt.hashSync('college@123', 10),
    }).save();
    const { password, __v, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, department, role } = req.body;
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      { name, email, phone, department, role },
      { new: true, projection: { password: 0, __v: 0 } }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
