const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @POST /api/orders
// Place a new order
const placeOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Get user cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // 2. Validate stock and build order items
    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product);

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: `Product ${item.product} is no longer available`,
        });
      }

      const variant = product.variants.find(
        (v) => v.name === item.variant.name
      );

      if (!variant) {
        return res.status(400).json({
          message: `Variant ${item.variant.name} not found`,
        });
      }

      // Backend validates stock
      if (variant.stock < item.quantity) {
        return res.status(400).json({
          message: `Only ${variant.stock} units of ${product.name} (${variant.name}) available`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        variant: { name: variant.name, price: variant.price },
        quantity: item.quantity,
        image: product.images[0] || '',
      });

      totalPrice += variant.price * item.quantity;
    }

    // 3. Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalPrice,
    });

    // 4. Reduce stock for each item
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      const variantIndex = product.variants.findIndex(
        (v) => v.name === item.variant.name
      );
      product.variants[variantIndex].stock -= item.quantity;
      await product.save();
    }

    // 5. Clear cart after order placed
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/orders/my
// Get logged in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/orders/:id
// Get single order by id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow owner or admin to view
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role === 'user'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/orders
// Admin — get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product', 'name');

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({ orders, totalOrders: orders.length, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/orders/:id/status
// Admin — update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;

    if (status === 'delivered') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.deliveredAt = Date.now();
    }

    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/orders/:id/cancel
// User — cancel their own order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only owner can cancel
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const variantIndex = product.variants.findIndex(
          (v) => v.name === item.variant.name
        );
        if (variantIndex >= 0) {
          product.variants[variantIndex].stock += item.quantity;
          await product.save();
        }
      }
    }

    res.json({ message: 'Order cancelled and stock restored', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};