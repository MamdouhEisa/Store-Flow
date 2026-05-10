const Joi = require('joi');

// Reusable validation schemas
const schemas = {
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
  }),

  employee: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'sales').required(),
    branch: Joi.string().optional().allow(null, '') // Optional for admins (auto Main Branch)
  }),

  product: Joi.object({
    name: Joi.string().max(100).required(),
    quantity: Joi.number().min(0).required(),
    branch: Joi.string().required().label('branch location') // location string
  }),

  transfer: Joi.object({
    fromBranch: Joi.string().required().label('from branch location'),
    toBranch: Joi.string().required().label('to branch location'),
    product: Joi.string().required(),
    quantity: Joi.number().min(1).required()
  })
};

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = { validate, schemas };

