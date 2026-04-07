import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { FiSearch } from 'react-icons/fi';

// Mock products (later from API)
const mockProducts = [
  { id: 1, name: 'Premium Red Clay Bricks', category: 'Bricks', price: 8, unit: 'piece', quantity: 50000, location: 'Ahmedabad', sellerName: 'Sharma Brick Works', rating: 4.8, badge: 'Best Seller', image: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=600' },
  { id: 2, name: 'UltraTech OPC 53 Grade Cement', category: 'Cement', price: 380, unit: 'bag', quantity: 500, location: 'Surat', sellerName: 'Rajesh Builders', rating: 4.6, image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600' },
  { id: 3, name: 'River Sand Premium Quality', category: 'Sand', price: 1200, unit: 'ton', quantity: 100, location: 'Vadodara', sellerName: 'Krishna Traders', rating: 4.9, badge: 'Hot Deal', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600' },
  { id: 4, name: 'TATA TMT 500D Steel Bars', category: 'Steel', price: 65, unit: 'kg', quantity: 10000, location: 'Rajkot', sellerName: 'Metro Steel Corp', rating: 4.7, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  { id: 5, name: 'Fly Ash Bricks Eco-Friendly', category: 'Bricks', price: 6, unit: 'piece', quantity: 30000, location: 'Gandhinagar', sellerName: 'Green Bricks Ltd', rating: 4.5, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600' },
  { id: 6, name: 'ACC PPC Cement 50kg', category: 'Cement', price: 360, unit: 'bag', quantity: 800, location: 'Mumbai', sellerName: 'Amar Building', rating: 4.4, badge: 'New', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600' },
];

const categories = ['All', 'Bricks', 'Cement', 'Sand', 'Steel'];

const Products = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = mockProducts.filter((p) => {
    const matchCategory = filter === 'All' || p.category === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>🧱 Construction Materials</h1>
        <p>Browse quality materials from verified sellers across India</p>
        <div className="search-bar">
          <FiSearch />
          <input type="text" placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-tabs">
          {categories.map((cat) => (
            <button key={cat} className={`filter-tab ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="products-content">
        <div className="products-grid">
          {filtered.length > 0 ? (
            filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <h3>😕 No products found</h3>
              <p>Try a different search or category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;