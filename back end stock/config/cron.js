const cron = require('node-cron');
const product = require("../models/Product");
const employee = require('../models/Employee');
const branch = require('../models/Branch');

// حط الموديلات في array
const models = [product, employee, branch];

// Auto-clean
const cleanupSoftDeletes = async () => {
    try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleteConditions = { 
        isDeleted: true, 
        deletedAt: { $lte: thirtyDaysAgo } 
    };

    const results = await Promise.all([
        product.deleteMany(deleteConditions),
        employee.deleteMany({ ...deleteConditions, role: { $ne: 'admin' } }),
        branch.deleteMany(deleteConditions)
    ]);

    results.forEach((r, i) => {
        if (r.deletedCount > 0) {
        console.log(`Cleanup completed: ${r.deletedCount} records deleted from ${models[i].modelName}`);
        }
    });

    } catch (error) {
    console.error('Cleanup error:', error);
    }
};

// ✅ الجدولة برا الفنكشن
cron.schedule('0 2 * * *', cleanupSoftDeletes);

console.log('Cron jobs initialized - Daily cleanup at 2 AM');

module.exports = cleanupSoftDeletes;