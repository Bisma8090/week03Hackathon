const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// --- MULTER CONFIG START ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/'); // Folder jahan images save honi hain
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });
// --- MULTER CONFIG END ---

router.get('/', getProducts);
router.get('/:id', getProductById);

// 'image' field name frontend FormData se match hona chahiye
router.post('/', protect, authorizeRoles('admin', 'superadmin'), upload.single('image'), createProduct);
router.put('/:id', protect, authorizeRoles('admin', 'superadmin'), upload.single('image'), updateProduct);

router.delete('/:id', protect, authorizeRoles('admin', 'superadmin'), deleteProduct);

module.exports = router;