// ==========================================
// 🔍 BrickBazaar - Frontend Validators
// ==========================================

// ========== Name Validation ==========
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return 'Name is required';
  }
  if (name.trim().length < 3) {
    return 'Name must be at least 3 characters';
  }
  if (name.trim().length > 50) {
    return 'Name cannot exceed 50 characters';
  }
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    return 'Name can only contain letters and spaces';
  }
  return '';
};

// ========== Email Validation ==========
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  if (email.length > 100) {
    return 'Email is too long';
  }
  return '';
};

// ========== Phone Validation ==========
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required';
  }
  // Remove spaces, dashes, +91
  const cleaned = phone.replace(/[\s\-+]/g, '').replace(/^91/, '');
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return 'Enter valid 10-digit Indian phone number (starts with 6-9)';
  }
  return '';
};

// ========== Phone Number Formatter ==========
export const formatPhone = (value) => {
  // Remove everything except digits
  const digits = value.replace(/\D/g, '');
  
  // Remove leading 91 if present
  const cleaned = digits.startsWith('91') && digits.length > 10 
    ? digits.slice(2) 
    : digits;
  
  // Limit to 10 digits
  return cleaned.slice(0, 10);
};

// ========== Password Validation ==========
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    errors.push('at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('one special character (!@#$%^&*)');
  }

  if (errors.length > 0) {
    return `Password needs: ${errors.join(', ')}`;
  }
  return '';
};

// ========== Password Strength Calculator ==========
export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, text: '', color: '' };

  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  if (password.length >= 16) score++;

  if (score <= 2) return { level: 1, text: 'Weak', color: '#ef4444' };
  if (score <= 4) return { level: 2, text: 'Medium', color: '#f59e0b' };
  if (score <= 5) return { level: 3, text: 'Strong', color: '#22c55e' };
  return { level: 4, text: 'Very Strong', color: '#10b981' };
};

// ========== Confirm Password ==========
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};

// ========== Pincode Validation ==========
export const validatePincode = (pincode) => {
  if (!pincode || !pincode.trim()) return ''; // Optional
  if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
    return 'Enter valid 6-digit Indian pincode';
  }
  return '';
};

// ========== City Validation ==========
export const validateCity = (city, required = false) => {
  if (!city || !city.trim()) {
    return required ? 'City is required' : '';
  }
  if (city.trim().length < 2) {
    return 'City must be at least 2 characters';
  }
  if (city.trim().length > 50) {
    return 'City cannot exceed 50 characters';
  }
  return '';
};

// ========== Product Validators ==========
export const validateProductName = (name) => {
  if (!name || !name.trim()) return 'Product name is required';
  if (name.trim().length < 3) return 'Product name must be at least 3 characters';
  if (name.trim().length > 100) return 'Product name cannot exceed 100 characters';
  return '';
};

export const validatePrice = (price) => {
  if (!price && price !== 0) return 'Price is required';
  const num = Number(price);
  if (isNaN(num) || num <= 0) return 'Price must be greater than 0';
  if (num > 10000000) return 'Price cannot exceed ₹1,00,00,000';
  return '';
};

export const validateQuantity = (quantity) => {
  if (!quantity && quantity !== 0) return 'Quantity is required';
  const num = Number(quantity);
  if (isNaN(num) || num < 1) return 'Quantity must be at least 1';
  if (!Number.isInteger(num)) return 'Quantity must be a whole number';
  if (num > 10000000) return 'Quantity is too large';
  return '';
};

export const validateDescription = (desc) => {
  if (!desc || !desc.trim()) return 'Description is required';
  if (desc.trim().length < 10) return 'Description must be at least 10 characters';
  if (desc.trim().length > 1000) return 'Description cannot exceed 1000 characters';
  return '';
};

export const validateLocation = (location) => {
  if (!location || !location.trim()) return 'Location is required';
  if (location.trim().length < 2) return 'Location must be at least 2 characters';
  if (location.trim().length > 100) return 'Location cannot exceed 100 characters';
  return '';
};

// ========== Delivery Address ==========
export const validateDeliveryAddress = (address) => {
  if (!address || !address.trim()) return 'Delivery address is required';
  if (address.trim().length < 5) return 'Address must be at least 5 characters';
  if (address.trim().length > 300) return 'Address cannot exceed 300 characters';
  return '';
};