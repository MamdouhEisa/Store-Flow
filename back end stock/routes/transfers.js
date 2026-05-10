const express = require('express');
const {
    createTransfer,
    getTransfers,
    approveTransfer,
    rejectTransfer
} = require('../controllers/transferController');

const authMiddleware = require('../middleware/auth');
const { adminOnly, adminOrSales } = require('../middleware/roles'); // ✅
const { validate, schemas } = require('../middleware/validate');   // ✅

const router = express.Router();

router.use(authMiddleware);

// create + get
router
    .route('/')
    .post(adminOrSales, validate(schemas.transfer), createTransfer) // ✅
    .get(adminOnly, getTransfers); // ✅

// approve / reject
router.patch('/:id/approve', adminOnly, approveTransfer);
router.patch('/:id/reject', adminOnly, rejectTransfer);

module.exports = router;