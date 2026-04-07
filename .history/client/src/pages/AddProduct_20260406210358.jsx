import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { productAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  FiPackage, 
  FiDollarSign, 
  FiLayers, 
  FiFileText, 
  FiMapPin, 
  FiImage, 
  FiArrowLeft 
} from 'react-icons/fi';

const AddProduct = () => {
  const { user, isAuthenticated, isSeller } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
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

  // Redirect if not seller
  if (!isAuthenticated || !isSeller) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Real API call to save product
      const response = await productAPI.create({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        unit: form.unit,
        quantity: Number(form.quantity),
        description: form.description,
        image: form.image || 'https://via.placeholder.com/400?text=Product+Image',
        location: form.location
      });

      console.log('✅ Product added:', response.data);
      toast.success('Product added successfully! 🎉');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('❌ Add product error:', error);
      const message = error.response?.data?.message || 'Failed to add product';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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

        <form className="add-product-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label><FiPackage /> Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Premium Red Clay Bricks"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><FiLayers /> Category</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="Bricks">Bricks</option>
                <option value="Cement">Cement</option>
                <option value="Sand">Sand</option>
                <option value="Steel">Steel</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><FiDollarSign /> Price (₹)</label>
              <input
                type="number"
                name="price"
                placeholder="Enter price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Unit</label>
              <select name="unit" value={form.unit} onChange={handleChange} required>
                <option value="piece">Piece</option>
                <option value="bag">Bag</option>
                <option value="ton">Ton</option>
                <option value="kg">Kg</option>
                <option value="cft">CFT</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity Available</label>
              <input
                type="number"
                name="quantity"
                placeholder="Stock quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label><FiMapPin /> Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Ahmedabad, Gujarat"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label><FiImage /> Image URL</label>
            <input
              type="url"
              name="image"
              placeholder="https://example.com/image.jpg"
              value={form.image}
              onChange={handleChange}
            />
            <small>Paste an image URL or leave empty for default</small>
          </div>

          <div className="form-group">
            <label><FiFileText /> Description</label>
            <textarea
              name="description"
              placeholder="Describe your product, its quality, usage, etc."
              value={form.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/seller/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding Product...' : '✅ Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;