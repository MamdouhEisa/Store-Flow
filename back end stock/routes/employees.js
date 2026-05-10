const express = require('express');
const {
    createEmployee,
    getEmployees,
    updateEmployee,
    disableEmployee
} = require('../controllers/employeeController');

const authMiddleware = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles'); 
const { validate, schemas } = require('../middleware/validate'); 

const router = express.Router();

router.use(authMiddleware);

// Admin only
router.use(adminOnly);

router
    .route('/')
    .post(validate(schemas.employee), createEmployee)
    .get(getEmployees);

router
    .route('/:id')
    .put(validate(schemas.employee), updateEmployee);

router.patch('/:id/disable', disableEmployee);

module.exports = router;