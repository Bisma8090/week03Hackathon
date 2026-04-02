const Product = require('../models/Product');
const axios = require('axios');

// Notify NestJS reviews service about product changes (fire-and-forget)
const notifyReviewsService = (productId, field, value) => {
  const token = process.env.INTERNAL_SERVICE_TOKEN || '';
  axios.post(
    'http://localhost:3001/api/reviews/notify-product-update',
    { productId, field, value },
    { headers: { Authorization: `Bearer ${token}` } }
  ).catch(() => {}); // silent — don't break the main flow
};

// 1. Get All Products
const getProducts = async (req, res) => {
  try {
    const { category, flavor, origin, qualities, caffeine, isOrganic, minPrice, maxPrice, minRating, sortBy, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (flavor) filter.flavor = { $regex: flavor, $options: 'i' };
    if (origin) filter.origin = { $regex: origin, $options: 'i' };
    if (qualities) filter.qualities = { $in: [qualities] };
    if (caffeine) filter.caffeine = caffeine;
    if (isOrganic === 'true') filter.isOrganic = true;
    if (minRating) filter.rating = { $gte: Number(minRating) };

    if (minPrice || maxPrice) {
      filter['variants.price'] = {};
      if (minPrice) filter['variants.price'].$gte = Number(minPrice);
      if (maxPrice) filter['variants.price'].$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'price-low') sortOption = { 'variants.0.price': 1 };
    else if (sortBy === 'price-high') sortOption = { 'variants.0.price': -1 };
    else if (sortBy === 'rating') sortOption = { rating: -1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sortOption).skip(skip).limit(limitNum);

    res.json({ products, currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalProducts: total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Single Product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Create Product (Laptop Upload + URL Fixed)
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // CASE 1: Agar laptop se file upload ki gayi hai
    if (req.file) {
      productData.images = [`/images/${req.file.filename}`];
    } 
    // CASE 2: Agar laptop se file nahi aayi, toh check karein 'imageUrl' field ko
    else if (req.body.imageUrl) {
      productData.images = [req.body.imageUrl];
    }

    // Variants ko string se array/object mein convert karein
    if (typeof productData.variants === 'string') {
      productData.variants = JSON.parse(productData.variants);
    }

    const product = await Product.create(productData);
    res.status(201).json({ success: true, product });
  } catch (err) {
    // Console check karein agar abhi bhi error aaye
    console.error("Create Product Error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

// 4. Update Product (Image Upload Support Added)
const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.images = [`/images/${req.file.filename}`];
    }

    if (updateData.variants && typeof updateData.variants === 'string') {
      updateData.variants = JSON.parse(updateData.variants);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Bonus: notify users who reviewed this product about price/stock changes
    if (updateData.variants) {
      notifyReviewsService(req.params.id, 'price/stock', 'updated');
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Delete Product (Soft Delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SAB KO EK SATH EXPORT KAREIN
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};