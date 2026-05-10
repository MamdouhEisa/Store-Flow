const Employee = require('../models/Employee');
const Branch = require('../models/Branch');
const { createLog } = require('../utils/helpers');
const { hashPassword } = require('../utils/auth');

// @desc    Create employee (admin only)
const createEmployee = async (req, res) => {
  try {
    let { username, password, role, branch: branchLocation } = req.body;
    const createdBy = req.employee._id;

    if (!username || !password || !role || !branchLocation) {
      return res.status(400).json({
        success: false,
        message: 'username, password, role, and branch are required'
      });
    }

    // ✅ Force lowercase username
    username = username.toLowerCase();

    // ✅ Find branch by location
    const branch = await Branch.findOne({ location: branchLocation, isDeleted: false });
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: `Branch location "${branchLocation}" not found`
      });
    }

    // ✅ Auto-assign Main Branch for admins (Headquarters)
    const finalBranchId =
      role === 'admin'
        ? (await Branch.findOne({ location: 'Headquarters', isDeleted: false }) || branch)._id
        : branch._id;

    // ✅ Hash password
    const hashedPassword = await hashPassword(password);

    // ✅ Create employee
    const employee = await Employee.create({
      username,
      password: hashedPassword,
      role,
      branch: finalBranchId,
      createdBy
    });

    // ✅ Create log
    await createLog({
      action: 'create_employee',
      userId: createdBy,
      branchId: finalBranchId,
      message: `${req.employee.username} created employee ${username} at ${branchLocation}`
    });

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('branch')
      .select('-password');

    res.status(201).json({
      success: true,
      employee: populatedEmployee
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all employees (admin only)
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ isDeleted: false })
      .populate('branch', 'name location')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update employee (admin only)
const updateEmployee = async (req, res) => {
  try {
    const updates = req.body;
    const updaterId = req.employee._id;
    const employeeId = req.params.id;

    const employee = await Employee.findById(employeeId);
    if (!employee || employee.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // ✅ Hash password if provided
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    // ✅ Force lowercase username if updated
    if (updates.username) {
      updates.username = updates.username.toLowerCase();
    }

    // ✅ Handle branch update
    if (updates.branch) {
      const branch = await Branch.findOne({ location: updates.branch, isDeleted: false });
      if (!branch) {
        return res.status(400).json({
          success: false,
          message: `Branch location "${updates.branch}" not found`
        });
      }
      updates.branch =
        updates.role === 'admin' || employee.role === 'admin'
          ? (await Branch.findOne({ location: 'Headquarters', isDeleted: false }) || branch)._id
          : branch._id;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, updates, {
      new: true,
      runValidators: true
    }).populate('branch');

    await createLog({
      action: 'update_employee',
      userId: updaterId,
      branchId: employee.branch,
      message: `${req.employee.username} updated employee ${employee.username}`
    });

    res.status(200).json({
      success: true,
      employee: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Disable employee (admin only)
const disableEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updaterId = req.employee._id;

    const employee = await Employee.findById(employeeId);
    if (!employee || employee.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.isActive = false;
    await employee.save();

    await createLog({
      action: 'disable_employee',
      userId: updaterId,
      branchId: employee.branch,
      message: `${req.employee.username} disabled employee ${employee.username}`
    });

    res.status(200).json({
      success: true,
      message: 'Employee disabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  updateEmployee,
  disableEmployee
};