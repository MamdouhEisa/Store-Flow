const express = require('express');
const { login, registerAdmin } = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

router.post('/register-admin', registerAdmin); // No validation - branch auto-set
router.post('/login', validate(schemas.login), login);

module.exports = router;

