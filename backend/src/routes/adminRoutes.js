const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllUsers,
  blockUnblockUser,
  changeUserRole,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/dashboard', protect, authorizeRoles('admin', 'superadmin'), getDashboard);
router.get('/users', protect, authorizeRoles('admin', 'superadmin'), getAllUsers);

// Temporary direct handler to debug
router.put('/users/:id/block', protect, authorizeRoles('admin', 'superadmin'), async (req, res) => {
  try {
    console.log('Block route hit, user id:', req.params.id);
    const User = require('../models/User');
    const user = await User.findById(req.params.id);
    console.log('User found:', user?.email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'superadmin') return res.status(403).json({ message: 'Cannot block superadmin' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    console.log('User blocked status:', user.isBlocked);
    res.json({ message: user.isBlocked ? 'User blocked' : 'User unblocked', user });
  } catch (error) {
    console.log('Block error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/role', protect, authorizeRoles('superadmin'), changeUserRole);
router.delete('/users/:id', protect, authorizeRoles('superadmin'), deleteUser);

module.exports = router;