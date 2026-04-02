const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Variant name is required'],
    // e.g. "250g", "500g", "1kg"
  },
  price: {
    type: Number,
    required: [true, 'Variant price is required'],
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    // e.g. "green-tea", "black-tea", "herbal-tea"
    enum: ['green-tea', 'black-tea', 'herbal-tea', 'white-tea', 'oolong-tea'],
  },
  flavor: {
    type: String,
    // e.g. "mint", "jasmine", "lemon"
  },
  origin: {
    type: String,
    // e.g. "India", "China", "Japan"
  },
  qualities: [{
    type: String,
    // e.g. "Energy", "Relax", "Protein", "Digestion"
  }],
  caffeine: {
    type: String,
    enum: ['No Caffeine', 'Low Caffeine', 'Medium Caffeine', 'High Caffeine'],
  },
  isOrganic: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  images: [String],
  variants: [variantSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);