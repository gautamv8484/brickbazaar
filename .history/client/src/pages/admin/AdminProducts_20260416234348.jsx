import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiSearch, FiTrash2, FiEye,
  FiChevronLeft, FiChevronRight, FiStar
} from 'react-icons/fi';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15, category: categoryFilter };
      if (search) params.search = search;

      const response = await adminAPI.getProducts(params);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This will also delete its reviews.`)) return;

    try {
      await adminAPI.deleteProduct(product._id);
      toast.success(`Product "${product.name}" deleted`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const defaultImage = 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=50';

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1><FiPackage /> Product Management</h1>
        <p>{total} total products</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <form className="admin-search" onSubmit={handleSearch}>
          <FiSearch />
          <input
            type="text"
            placeholder="Search by product name, seller, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="admin-filter-tabs">
          {['All', 'Bricks', 'Cement', 'Sand', 'Steel', 'Other'].map(cat => (
            <button
              key={cat}
              className={`admin-filter-tab ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => { setCategoryFilter(cat); setPage(1); }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="loader"></div><p>Loading products...</p></div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Seller</th>
                  <th>Location</th>
                  <th>Rating</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <div className="td-product-info">
                        <img
                          src={product.image || defaultImage}
                          alt={product.name}
                          className="td-product-img"
                          onError={(e) => { e.target.src = defaultImage; }}
                        />
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td><span className="category-badge">{product.category}</span></td>
                    <td className="td-amount">₹{product.price}/{product.unit}</td>
                    <td>
                      <span className={product.quantity > 0 ? 'text-success' : 'text-danger'}>
                        {product.quantity?.toLocaleString()}
                      </span>
                    </td>
                    <td>{product.sellerName}</td>
                    <td>{product.location}</td>
                    <td>
                      <div className="td-rating">
                        <FiStar fill="#FFC107" stroke="#FFC107" size={14} />
                        {product.rating?.toFixed(1) || '0.0'}
                        {product.numReviews > 0 && <small>({product.numReviews})</small>}
                      </div>
                    </td>
                    <td className="td-date">{formatDate(product.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <Link to={`/product/${product._id}`} className="admin-action-btn view" title="View">
                          <FiEye />
                        </Link>
                        <button className="admin-action-btn delete" onClick={() => handleDelete(product)} title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <FiChevronLeft /> Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;