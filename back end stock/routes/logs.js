const express = require('express');
const { getLogs } = require('../controllers/logController');
const authMiddleware = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

const router = express.Router();

router.use(authMiddleware);
router.use(adminOnly);

router.get('/', getLogs);

module.exports = router;

