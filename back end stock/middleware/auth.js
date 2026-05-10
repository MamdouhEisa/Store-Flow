const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const { verifyTokenPayload } = require('../utils/auth');

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyTokenPayload(token);
    const employee = await Employee.findById(decoded.employeeId).populate('branch');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    // Check if account is active and not locked/deleted
    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled.'
      });
    }

    // 🔒 Middleware lock check DISABLED

    if (employee.isDeleted) {
      return res.status(403).json({
        success: false,
        message: 'Account no longer exists.'
      });
    }

    req.employee = employee;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = authMiddleware;

