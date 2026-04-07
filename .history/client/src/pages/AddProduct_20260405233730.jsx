import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUpload, FiPackage, FiDollarSign, FiMapPin, FiFileText, FiSave } from 'react-icons/fi';

const categories = ['Bricks', 'Cement', 'Sand', 'Steel', 'Tiles', 'Paint', 'Other'];
const units = ['piece', 'kg', 'bag', 'ton', 'sq.ft', 'meter'];

const AddProduct = () => {
  const { user, isAuthenticated, isSeller } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', price: '', unit: 'piece', category: '',
    quantity: '', location: '', description: '', image: ''
  });

  if (!isAuthenticated || !isSeller) return <Navigate to="/login" />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: API call
      console.log('New product:', { ...form, sellerId: user.id, sellerName: user.name });
      toast.success('Product added successfully!');
      navigate('/seller/dashboard');
    } catch (error) {
      toast.error('Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <div className="add-product-header">
          <h1>➕ Add New Product</h1>
          <p>List your construction material for buyers</p>
        </div>

        <form className="add-product-form" onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="image-upload">
            <label>Product Image</label>
            {form.image ? (
              <div className="image-preview">
                <img src={form.image} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            ) : (
              <div className="image-upload-area" onClick={() => document.getElementById('imageInput').focus()}>
                <FiUpload size={40} />
                <h4>Paste image URL below</h4>
              </div>
            )}
            <input type="text" id="imageInput" name="image" placeholder="Paste image URL" value={form.image} onChange={handleChange} style={{ marginTop: 10, width: '100%', padding: 14, background: 'var(--gray-50)', border: '2px solid var(--gray-200)', borderRadius: 12 }} />
          </div>

          <div className="form-group">
            <label><FiPackage /> Product Name *</label>
            <input type="text" name="name" placeholder="e.g., Red Clay Bricks" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><FiDollarSign /> Price (₹) *</label>
              <input type="number" name="price" placeholder="e.g., 8" value={form.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Unit *</label>
              <select name="unit" value={form.unit} onChange={handleChange}>
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input type="number" name="quantity" placeholder="e.g., 50000" value={form.quantity} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label><FiMapPin /> Location *</label>
            <input type="text" name="location" placeholder="e.g., Ahmedabad, Gujarat" value={form.location} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label><FiFileText /> Description</label>
            <textarea name="description" placeholder="Describe your product..." value={form.description} onChange={handleChange} rows={4} style={{ width: '100%', padding: 14, background: 'var(--gray-50)', border: '2px solid var(--gray-200)', borderRadius: 12, resize: 'vertical' }} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            <FiSave /> {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;