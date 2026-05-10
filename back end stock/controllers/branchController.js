const Branch = require('../models/Branch');
const Employee = require('../models/Employee');
const { createLog } = require('../utils/helpers');

// @desc    Create branch (admin)
const createBranch = async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    const populatedBranch = await Branch.findById(branch._id).populate('deletedBy', 'username');

    await createLog('create_branch', req.employee._id, null, branch._id, null, `${req.employee.username} created branch ${branch.name}`);

    res.status(201).json({
      success: true,
      branch: populatedBranch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all branches (admin)
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ isDeleted: false })
      .populate('deletedBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update branch (admin)
const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('deletedBy', 'username');

    if (!branch || branch.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    await createLog('update_branch', req.employee._id, null, branch._id, null, `${req.employee.username} updated branch ${branch.name}`);

    res.status(200).json({
      success: true,
      branch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Soft delete branch (admin)
const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch || branch.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    branch.isDeleted = true;
    branch.deletedAt = new Date();
    branch.deletedBy = req.employee._id;
    await branch.save();

    await createLog('delete_branch', req.employee._id, null, branch._id, null, `${req.employee.username} soft-deleted branch ${branch.name}`);

    res.status(200).json({
      success: true,
      message: 'Branch soft-deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBranch,
  getBranches,
  updateBranch,
  deleteBranch
};

