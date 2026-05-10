const express = require('express');
const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const authMiddleware = require('../middleware/auth');
const { adminOnly, adminOrSales } = require('../middleware/roles'); // ✅
const { validate, schemas } = require('../middleware/validate');   // ✅

const Joi = require('joi');

const router = express.Router();

const productUpdateSchema = Joi.object({
    quantity: Joi.number().min(0).optional()
});

router.use(authMiddleware);

// ✅ كل الناس (admin + sales)
router.get('/', getProducts);

// ✅ admin بس
router.post('/', adminOnly, validate(schemas.product), createProduct);

// ✅ admin + sales (تقليل الكمية)
router.put('/:id', adminOrSales, validate(productUpdateSchema), updateProduct);

// ✅ admin بس
router.delete('/:id', adminOnly, deleteProduct);

module.exports = router;