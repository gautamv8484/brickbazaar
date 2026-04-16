import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { FiSearch, FiFilter, FiMapPin, FiStar, FiPackage } from 'react-icons/fi';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Fetch products from API - runs only ONCE on mount
  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array = run once

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products...');
      
      const response = await productAPI.getAll();
      console.log('📦 Products fetched:', response.data);
      
      setProducts(response.data.products || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) ||
                         product.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  // Default image URL
  const defaultImage = 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=400';

  // Handle image error - only set once to prevent loop
  const handleImageError = (e) => {
    if (e.target.src !== defaultImage) {
      e.target.src = defaultImage;
    }
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-loading">
          <div className="loader"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="products-error">
          <p>❌ {error}</p>
          <button className="btn btn-primary" onClick={fetchProducts}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="products-header-content">
          <h1>🧱 All Products</h1>
          <p>Browse quality construction materials from verified sellers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="products-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <FiFilter className="filter-icon" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Bricks">Bricks</option>
            <option value="Cement">Cement</option>
            <option value="Sand">Sand</option>
            <option value="Steel">Steel</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Products Count */}
      <div className="products-count">
        <p>Showing <strong>{filteredProducts.length}</strong> products</p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <FiPackage size={60} />
          <h3>No Products Found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div 
              key={product._id} 
              className="product-card"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <div className="product-image">
                <img 
                  src={product.image || defaultImage} 
                  alt={product.name}
                  onError={handleImageError}
                />
                <span className="product-category">{product.category}</span>
              </div>

              <div className="product-content">
                <h3>{product.name}</h3>
                
                <div className="product-meta">
                  <span className="product-rating">
                    <FiStar fill="#f59e0b" stroke="#f59e0b" />
                    {product.rating || 4.5}
                  </span>
                  <span className="product-location">
                    <FiMapPin size={14} />
                    {product.location}
                  </span>
                </div>

                <p className="product-description">
                  {product.description?.substring(0, 60)}...
                </p>

                <div className="product-footer">
                  <div className="product-price">
                    <span className="price">₹{product.price}</span>
                    <span className="unit">/ {product.unit}</span>
                  </div>
                  <span className="product-stock">
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                  </span>
                </div>

                <div className="product-seller">
                  Sold by: <strong>{product.sellerName}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;