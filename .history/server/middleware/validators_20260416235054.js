const { body, param, query, validationResult } = require('express-validator');

// ========== Helper: Handle Validation Errors ==========
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0].message, // First error as main message
      errors: formattedErrors
    });
  }
  next();
};

// ==========================================
// 🔐 AUTH VALIDATORS
// ==========================================

const registerValidator = [
  // Name
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces')
    .escape(),

  // Email
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email is too long'),

  // Phone
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Enter valid 10-digit Indian phone number (starts with 6-9)'),

  // Password
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character (!@#$%^&*)'),

  // Role
     body('role')
    .notEmpty().withMessage('Please select a role')
    .isIn(['buyer', 'seller', 'admin']).withMessage('Role must be buyer, seller or admin'),

  // City (required for seller)
  body('city')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty().withMessage('City is required for sellers')
    .isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters'),

  // Pincode (optional but validate if provided)
  body('pincode')
    .optional({ checkFalsy: true })
    .matches(/^[1-9][0-9]{5}$/).withMessage('Enter valid 6-digit Indian pincode'),

  // Address (optional)
  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters')
    .escape(),

  // Lat/Lng (optional)
  body('lat')
    .optional({ nullable: true })
    .isFloat({ min: 6, max: 38 }).withMessage('Invalid latitude for India'),

  body('lng')
    .optional({ nullable: true })
    .isFloat({ min: 68, max: 98 }).withMessage('Invalid longitude for India'),

  handleValidationErrors
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  // ✅ NEW - Replace the role validation line
  body('role')
    .notEmpty().withMessage('Please select a role')
    .isIn(['buyer', 'seller', 'admin']).withMessage('Role must be buyer, seller or admin'),

  handleValidationErrors
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces')
    .escape(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Enter valid 10-digit Indian phone number'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('City cannot exceed 50 characters'),

  body('pincode')
    .optional({ checkFalsy: true })
    .matches(/^[1-9][0-9]{5}$/).withMessage('Enter valid 6-digit Indian pincode'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters')
    .escape(),

  handleValidationErrors
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('New password must contain at least one special character')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  handleValidationErrors
];

// ==========================================
// 📦 PRODUCT VALIDATORS
// ==========================================

const addProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Product name must be 3-100 characters')
    .escape(),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Bricks', 'Cement', 'Sand', 'Steel', 'Other']).withMessage('Invalid category'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0')
    .isFloat({ max: 10000000 }).withMessage('Price cannot exceed ₹1,00,00,000'),

  body('unit')
    .notEmpty().withMessage('Unit is required')
    .isIn(['piece', 'bag', 'ton', 'kg', 'cft']).withMessage('Invalid unit'),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .isInt({ max: 10000000 }).withMessage('Quantity is too large'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ min: 2, max: 100 }).withMessage('Location must be 2-100 characters'),

  body('image')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Invalid image URL'),

  handleValidationErrors
];

const updateProductValidator = [
  param('id')
    .isMongoId().withMessage('Invalid product ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Product name must be 3-100 characters')
    .escape(),

  body('category')
    .optional()
    .isIn(['Bricks', 'Cement', 'Sand', 'Steel', 'Other']).withMessage('Invalid category'),

  body('price')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0')
    .isFloat({ max: 10000000 }).withMessage('Price cannot exceed ₹1,00,00,000'),

  body('unit')
    .optional()
    .isIn(['piece', 'bag', 'ton', 'kg', 'cft']).withMessage('Invalid unit'),

  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantity cannot be negative')
    .isInt({ max: 10000000 }).withMessage('Quantity is too large'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Location must be 2-100 characters'),

  handleValidationErrors
];

// ==========================================
// 🛒 ORDER VALIDATORS
// ==========================================

const createOrderValidator = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .isInt({ max: 10000000 }).withMessage('Quantity is too large'),

  body('transportRequired')
    .optional()
    .isBoolean().withMessage('transportRequired must be true or false'),

  body('vehicleType')
    .optional()
    .isIn(['none', 'mini', 'medium', 'large', 'heavy']).withMessage('Invalid vehicle type'),

  // Delivery address required if transport needed
  // ✅ NEW - FIXED
body('deliveryAddress')
    .custom((value, { req }) => {
      const transport = req.body.transportRequired;
      // Check if transport is required (handles both string 'true' and boolean true)
      if (transport === true || transport === 'true') {
        if (!value || value.trim().length < 5) {
          throw new Error('Delivery address is required when transport is selected (min 5 characters)');
        }
        if (value.trim().length > 300) {
          throw new Error('Delivery address cannot exceed 300 characters');
        }
      }
      return true;
    }),

  body('estimatedDistance')
    .optional()
    .isFloat({ min: 1, max: 500 }).withMessage('Distance must be between 1-500 km'),

  handleValidationErrors
];

const updateOrderStatusValidator = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid order status'),

  handleValidationErrors
];

// ==========================================
// 🔍 QUERY VALIDATORS
// ==========================================

const productQueryValidator = [
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),

  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),

  query('category')
    .optional()
    .isIn(['All', 'Bricks', 'Cement', 'Sand', 'Steel', 'Other']).withMessage('Invalid category filter'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long')
    .escape(),

  handleValidationErrors
];

const vehicleSuggestValidator = [
  query('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Bricks', 'Cement', 'Sand', 'Steel', 'Other']).withMessage('Invalid category'),

  query('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),

  query('distance')
    .optional()
    .isFloat({ min: 1, max: 500 }).withMessage('Distance must be between 1-500 km'),

  handleValidationErrors
];

// ==========================================
// 📤 PARAM VALIDATORS
// ==========================================

const mongoIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),

  handleValidationErrors
];

module.exports = {
  // Auth
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  // Product
  addProductValidator,
  updateProductValidator,
  productQueryValidator,
  // Order
  createOrderValidator,
  updateOrderStatusValidator,
  vehicleSuggestValidator,
  // Common
  mongoIdValidator,
  handleValidationErrors
};