const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['create_product', 'update_product', 'delete_product', 'transfer', 'login', 'failed_login', 'create_employee', 'update_employee', 'disable_employee', 'approve_transfer', 'reject_transfer']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  transfer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transfer'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// TTL index for logs older than 90 days (optional cleanup)
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Indexes
logSchema.index({ action: 1 });
logSchema.index({ user: 1 });
logSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);

