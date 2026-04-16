import React, { useState, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { productAPI, uploadAPI } from '../services/api';
import { toast } from 'react-toastify';
import FormError from '../components/FormError';
import {
  validateProductName,
  validatePrice,
  validateQuantity,
  validateDescription,
  validateLocation
} from '../utils/validators';
import { 
  FiPackage, FiDollarSign, FiLayers, FiFileText, 
  FiMapPin, FiImage, FiArrowLeft, FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const AddProduct = () => {
  const { user, isAuthenticated, isSeller } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    category: 'Bricks',
    price: '',
    unit: 'piece',
    quantity: '',
    description: '',
    image: '',
    location: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (!isAuthenticated || !isSeller) {
    navigate('/login');
    return null;
  }

  // ========== Validate Single Field ==========
  const validateField = (name, value) => {
    switch (name) {
      case 'name': return validateProductName(value);
      case 'price': return validatePrice(value);
      case 'quantity': return validateQuantity(value);
      case 'description': return validateDescription(value);
      case 'location': return validateLocation(value);
      default: return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // ========== Image Handling with Validation ==========
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only images are allowed (JPEG, PNG, GIF, WebP)');
      e.target.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      e.target.value = '';
      return;
    }

    // Validate image dimensions (optional)
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        toast.error('Image must be at least 100x100 pixels');
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    };
    img.src = URL.createObjectURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // ========== Validate All ==========
  const validateAll = () => {
    const newErrors = {
      name: validateProductName(form.name),
      price: validatePrice(form.price),
      quantity: validateQuantity(form.quantity),
      description: validateDescription(form.description),
      location: validateLocation(form.location)
    };

    setErrors(newErrors);
    setTouched({
      name: true, price: true, quantity: true,
      description: true, location: true
    });

    return !Object.values(newErrors).some(err => err !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error('Please fix the errors in the form');
      const firstError = document.querySelector('.form-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      let imageUrl = form.image;

      if (imageFile) {
        setUploading(true);
        const uploadRes = await uploadAPI.uploadImage(imageFile);
        imageUrl = `http://localhost:5000${uploadRes.data.imageUrl}`;
        setUploading(false);
      }

      const response = await productAPI.create({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        unit: form.unit,
        quantity: Number(form.quantity),
        description: form.description.trim(),
        image: imageUrl || 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=400',
        location: form.location.trim()
      });

      toast.success('Product added successfully! 🎉');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('❌ Add product error:', error);
      const errorData = error.response?.data;

      if (errorData?.errors) {
        const backendErrors = {};
        errorData.errors.forEach(err => {
          if (err.field) backendErrors[err.field] = err.message;
        });
        setErrors(prev => ({ ...prev, ...backendErrors }));
      }

      toast.error(errorData?.message || 'Failed to add product');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const hasError = (field) => touched[field] && errors[field];

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <Link to="/seller/dashboard" className="auth-back">
          <FiArrowLeft /> Back to Dashboard
        </Link>

        <div className="add-product-header">
          <h1>📦 Add New Product</h1>
          <p>List your construction materials for buyers across India</p>
        </div>

        <form className="add-product-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            {/* Product Name */}
            <div className={`form-group ${hasError('name') ? 'has-error' : touched.name && !errors.name ? 'has-success' : ''}`}>
              <label><FiPackage /> Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Premium Red Clay Bricks"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={100}
              />
              <FormError error={errors.name} show={touched.name} />
              <small className="char-count">{form.name.length}/100</small>
            </div>

            {/* Category */}
            <div className="form-group">
              <label><FiLayers /> Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="Bricks">Bricks</option>
                <option value="Cement">Cement</option>
                <option value="Sand">Sand</option>
                <option value="Steel">Steel</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {/* Price */}
            <div className={`form-group ${hasError('price') ? 'has-error' : touched.price && !errors.price ? 'has-success' : ''}`}>
              <label><FiDollarSign /> Price (₹)</label>
              <input
                type="number"
                name="price"
                placeholder="Enter price"
                value={form.price}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0.01"
                step="0.01"
              />
              <FormError error={errors.price} show={touched.price} />
            </div>

            {/* Unit */}
            <div className="form-group">
              <label>Unit</label>
              <select name="unit" value={form.unit} onChange={handleChange}>
                <option value="piece">Piece</option>
                <option value="bag">Bag</option>
                <option value="ton">Ton</option>
                <option value="kg">Kg</option>
                <option value="cft">CFT</option>
              </select>
            </div>

            {/* Quantity */}
            <div className={`form-group ${hasError('quantity') ? 'has-error' : touched.quantity && !errors.quantity ? 'has-success' : ''}`}>
              <label>Quantity Available</label>
              <input
                type="number"
                name="quantity"
                placeholder="Stock quantity"
                value={form.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                min="1"
                step="1"
              />
              <FormError error={errors.quantity} show={touched.quantity} />
            </div>
          </div>

          {/* Location */}
          <div className={`form-group ${hasError('location') ? 'has-error' : touched.location && !errors.location ? 'has-success' : ''}`}>
            <label><FiMapPin /> Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Ahmedabad, Gujarat"
              value={form.location}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={100}
            />
            <FormError error={errors.location} show={touched.location} />
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label><FiImage /> Product Image</label>
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button 
                  type="button" 
                  className="remove-image"
                  onClick={handleRemoveImage}
                >
                  ✕
                </button>
              </div>
            )}
            
            {!imagePreview && (
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="file-input"
              />
            )}
            <small>Upload product image (Max 5MB, JPG/PNG/GIF/WebP) - Optional</small>
          </div>

          {/* Description */}
          <div className={`form-group ${hasError('description') ? 'has-error' : touched.description && !errors.description ? 'has-success' : ''}`}>
            <label><FiFileText /> Description</label>
            <textarea
              name="description"
              placeholder="Describe your product quality, usage, specifications... (min 10 characters)"
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="4"
              maxLength={1000}
            />
            <FormError error={errors.description} show={touched.description} />
            <small className="char-count">{form.description.length}/1000</small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => navigate('/seller/dashboard')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || uploading}
            >
              {uploading ? '📤 Uploading Image...' : loading ? 'Adding Product...' : '✅ Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;