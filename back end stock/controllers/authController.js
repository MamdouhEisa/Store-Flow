const Employee = require('../models/Employee');
const Branch = require('../models/Branch');
const { comparePassword, generateToken, hashPassword } = require('../utils/auth');
const { createLog } = require('../utils/helpers');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  try {
      const { username, password } = req.body;

      // 🔍 Find employee
      const employee = await Employee.findOne({
        username: username,
        isDeleted: false
      }).populate('branch');
      
      console.log(`👤 Employee found: ${!!employee}, username in DB: "${employee?.username}"`);

      // ❌ لو مش موجود
      if (!employee) {
        console.log(`⚠️ Failed login attempt for username: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
  // 🔐 تحقق من الباسورد
      console.log('🔐 Testing password compare...');
      const isPasswordValid = await comparePassword(password, employee.password);
      console.log(`✅ Password valid: ${isPasswordValid}`);
      if (!isPasswordValid) {
        console.log(`⚠️ Failed login attempt for username wrong password: ${username}`);

    // ✅ إنشاء log للفشل لو تحب تسجل الـ userId ممكن تعمل شرط هنا
    await createLog({
      action: 'failed_login',
      userId: employee._id,
      branchId: employee.branch?._id,
      message: `Failed login attempt for ${username}`
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // ✅ إنشاء log للنجاح
  await createLog({
    action: 'login',
    userId: employee._id,
    branchId: employee.branch?._id,
    message: `${employee.username} logged in successfully`
  });
      // ✅ Reset attempts on success
      employee.failedLoginAttempts = 0;
      employee.lockUntil = undefined;
      await employee.save();

      // 🔑 Generate token
      const token = generateToken(employee._id);

      // ✅ Success log
      await createLog({
        action: 'login',
        userId: employee._id,
        branchId: employee.branch?._id,
        message: `${employee.username} logged in successfully`
      });

      // 🎉 Response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        employee: {
          id: employee._id,
          username: employee.username,
          role: employee.role,
          branch: employee.branch?._id,
          branchName: employee.branch?.name
        }
      });

    } catch (error) {
      console.error('❌ Login error:', error.message);

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  const registerAdmin = async (req, res) => {
    try {
      const { username, password, role, branch } = req.body;

      // ✅ Check if admin already exists
      const existingAdmin = await Employee.findOne({ role: 'admin', isDeleted: false });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Admin already exists. Use /login instead.'
        });
      }

      // ✅ Create Main Branch if not exists
      let mainBranch = await Branch.findOne({ name: 'Main Branch' });
      if (!mainBranch) {
        mainBranch = await Branch.create({
          name: 'Main Branch',
          location: 'Headquarters'
        });
        console.log('✅ Created Main Branch:', mainBranch._id);
      }

      // ✅ Force Main Branch for all admins
      const branchId = mainBranch._id;

      // ✅ Hash password
      const hashedPassword = await hashPassword(password);

      // ✅ Create first admin
      const admin = await Employee.create({
        username,
        password: hashedPassword,
        role: 'admin',
        branch: branchId,
        createdBy: null
      });

      // ✅ Generate token
      const token = generateToken(admin._id);

      // 🎉 Populate and return
      const populatedAdmin = await Employee.findById(admin._id)
        .populate('branch')
        .select('-password -failedLoginAttempts -lockUntil');

      console.log('✅ First admin created:', username);

      res.status(201).json({
        success: true,
        message: 'Admin registered successfully! Use this token to access admin features.',
        token,
        admin: {
          id: populatedAdmin._id,
          username: populatedAdmin.username,
          role: populatedAdmin.role,
          branch: populatedAdmin.branch?._id,
          branchName: populatedAdmin.branch?.name
        }
      });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    console.error('❌ Register admin error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = { 
  login,
  registerAdmin 
};
