const Log = require('../models/Log');
const Product = require('../models/Product');

// ✅ Create Log (Professional Version)
const createLog = async ({
  action,
  userId,
  productId = null,
  branchId = null,
  transferId = null,
  message,
  details = {}
}) => {
  try {
    // 🛡️ حماية من الخطأ
    if (!userId) {
      console.log("⚠️ Log skipped: userId is missing");
      return;
    }

    await Log.create({
      action,
      user: userId,
      product: productId,
      branch: branchId,
      transfer: transferId,
      message,
      details
    });

  } catch (error) {
    console.error('❌ Failed to create log:', error.message);
  }
};

// ✅ Low Stock Alert
const checkLowQuantityAlert = async (productId, branchId, userId) => {
  try {
    const product = await Product.findOne({
      _id: productId,
      branch: branchId,
      isDeleted: false
    });

    if (product && product.quantity <= 10) {
      const message = `Low stock alert: ${product.name} has ${product.quantity} units remaining`;

      await createLog({
        action: 'low_stock',
        userId,
        productId,
        branchId,
        message
      });

      console.log(message);
      return { alert: true, message };
    }

    return { alert: false };

  } catch (error) {
    console.error('❌ Alert error:', error.message);
    return { alert: false };
  }
};

module.exports = {
  createLog,
  checkLowQuantityAlert
};