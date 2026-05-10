const Transfer = require('../models/Transfer');
const Product = require('../models/Product');
const Branch = require('../models/Branch');
const { createLog, withTransaction } = require('../utils/helpers');
const mongoose = require('mongoose');

// @desc    Create transfer request (admin/sales)
const createTransfer = async (req, res) => {
  try {
    const { fromBranch: fromLocation, toBranch: toLocation, product, quantity } = req.body;
    const transferData = {
      product,
      quantity,
      createdBy: req.employee._id
    };

    // Find branches by location
    const [fromBranch, toBranch] = await Promise.all([
      Branch.findOne({ location: fromLocation, isDeleted: false }),
      Branch.findOne({ location: toLocation, isDeleted: false })
    ]);

    if (!fromBranch || !toBranch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch locations'
      });
    }

    transferData.fromBranch = fromBranch._id;
    transferData.toBranch = toBranch._id;

    // Check product exists and has enough quantity in fromBranch
    const sourceProduct = await Product.findOne({
      _id: product,
      branch: fromBranch._id,
      isDeleted: false
    });

    if (!product || product.quantity < transferData.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient quantity in source branch'
      });
    }

    const transfer = await Transfer.create(transferData);

    await createLog('transfer', req.employee._id, transferData.product, transferData.fromBranch, transfer._id,
      `${req.employee.username} created transfer request for ${transferData.quantity} units of product ${product.name} from ${fromBranch.name} to ${toBranch.name}`);

    const populatedTransfer = await Transfer.findById(transfer._id)
      .populate('fromBranch', 'name')
      .populate('toBranch', 'name')
      .populate('product')
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      transfer: populatedTransfer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get transfers (admin)
const getTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find()
      .populate('fromBranch', 'name location')
      .populate('toBranch', 'name location')
      .populate('product', 'name')
      .populate('createdBy', 'username')
      .populate('approvedBy', 'username')
      .populate('rejectedBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transfers.length,
      data: transfers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve transfer (admin only)
const approveTransfer = async (req, res) => {
  try {
    const transferId = req.params.id;
    const approverId = req.employee._id;

    const session = await mongoose.startSession();

    const result = await withTransaction(session, async (session) => {
      const transfer = await Transfer.findById(transferId).session(session);
      if (!transfer || transfer.status !== 'pending') {
        throw new Error('Transfer not found or not pending');
      }

      // Update transfer status
      transfer.status = 'approved';
      transfer.approvedBy = approverId;
      await transfer.save({ session });

      // Update product quantities atomically
      await Promise.all([
        Product.findByIdAndUpdate(
          transfer.product,
          { $inc: { quantity: -transfer.quantity } },
          { session }
        ),
        Product.findOneAndUpdate(
          { _id: transfer.product, branch: transfer.toBranch },
          { $inc: { quantity: transfer.quantity } },
          { new: true, upsert: true, session } // Create if not exists
        )
      ]);

      return transfer;
    });

    const populatedTransfer = await Transfer.findById(result._id)
      .populate('fromBranch toBranch product createdBy approvedBy', 'name username');

    await createLog('approve_transfer', approverId, result.product, result.fromBranch, result._id,
      `${req.employee.username} approved transfer of ${result.quantity} units of ${populatedTransfer.product.name}`);

    res.status(200).json({
      success: true,
      transfer: populatedTransfer,
      message: 'Transfer approved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject transfer (admin only)
const rejectTransfer = async (req, res) => {
  try {
    const transferId = req.params.id;
    const rejecterId = req.employee._id;

    const transfer = await Transfer.findById(transferId);
    if (!transfer || transfer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transfer not found or not pending'
      });
    }

    transfer.status = 'rejected';
    transfer.rejectedBy = rejecterId;
    await transfer.save();

    const populatedTransfer = await Transfer.findById(transfer._id)
      .populate('fromBranch toBranch product createdBy rejectedBy', 'name username');

    await createLog('reject_transfer', rejecterId, transfer.product, transfer.fromBranch, transfer._id,
      `${req.employee.username} rejected transfer of ${transfer.quantity} units of ${populatedTransfer.product.name}`);

    res.status(200).json({
      success: true,
      transfer: populatedTransfer,
      message: 'Transfer rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTransfer,
  getTransfers,
  approveTransfer,
  rejectTransfer
};

