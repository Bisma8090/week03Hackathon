const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// User routes
router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/', protect, authorizeRoles('admin', 'superadmin'), getAllOrders);
router.put('/:id/status', protect, authorizeRoles('admin', 'superadmin'), updateOrderStatus);

module.exports = router;