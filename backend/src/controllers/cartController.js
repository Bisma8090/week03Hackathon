const Cart = require('../models/Cart');
const Product = require('../models/Product');

const calcTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  return { totalItems, totalPrice };
};

// @GET /api/cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name images isActive'
    );

    if (!cart) {
      return res.json({ items: [], totalItems: 0, totalPrice: 0 });
    }

    const { totalItems, totalPrice } = calcTotals(cart.items);
    res.json({ items: cart.items, totalItems, totalPrice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, variantName, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const variant = product.variants.find((v) => v.name === variantName);
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({
        message: `Only ${variant.stock} items left in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variant.name === variantName
    );

    if (existingItemIndex >= 0) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (variant.stock < newQty) {
        return res.status(400).json({
          message: `Only ${variant.stock} items available`,
        });
      }
      cart.items[existingItemIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        variant: { name: variant.name, price: variant.price },
        quantity,
      });
    }

    await cart.save();
    const { totalItems, totalPrice } = calcTotals(cart.items);

    res.json({
      message: 'Item added to cart',
      items: cart.items,
      totalItems,
      totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/cart/:itemId
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);
    const variant = product.variants.find((v) => v.name === item.variant.name);

    if (variant.stock < quantity) {
      return res.status(400).json({
        message: `Only ${variant.stock} items available in stock`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    const { totalItems, totalPrice } = calcTotals(cart.items);
    res.json({ message: 'Cart updated', items: cart.items, totalItems, totalPrice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/cart/:itemId
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    await cart.save();
    const { totalItems, totalPrice } = calcTotals(cart.items);
    res.json({ message: 'Item removed', items: cart.items, totalItems, totalPrice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/cart/clear
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Cart cleared', items: [], totalItems: 0, totalPrice: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };