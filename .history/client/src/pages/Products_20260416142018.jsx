import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  FiSearch,
  FiMapPin,
  FiStar,
  FiPackage,
  FiNavigation,
  FiAlertCircle,
  FiGrid,
  FiList,
  FiChevronDown,
  FiChevronUp,
  FiTruck,
  FiCheck,
  FiX
} from 'react-icons/fi';

const Products = () => {
  const navigate = useNavigate();

  // Products states
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState({ nearYou: [], nearby: [], others: [] });
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState('list'); // list or grid
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sidebar toggle (mobile)
  const [showFilters, setShowFilters] = useState(false);

  // Location states
  const [buyerLocation, setBuyerLocation] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState('idle');
  const [manualCity, setManualCity] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const defaultImage = 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=400';

  // On Mount
  useEffect(() => {
    askForLocation();
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchProducts();
  }, [buyerLocation, search, category]);

  // Ask Location
  const askForLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      fetchProducts();
      return;
    }

    setLocationStatus('detecting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setBuyerLocation({ lat: latitude, lng: longitude });
        setLocationStatus('granted');
      },
      () => {
        setLocationStatus('denied');
        fetchProducts();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (buyerLocation.lat && buyerLocation.lng) {
        params.lat = buyerLocation.lat;
        params.lng = buyerLocation.lng;
      }
      if (search) params.search = search;
      if (category !== 'All') params.category = category;

      const response = await productAPI.getAllWithLocation(params);

      if (response.data.hasLocation) {
        setGroups(response.data.groups || { nearYou: [], nearby: [], others: [] });
        setProducts(response.data.products || []);
        setHasLocation(true);
      } else {
        setProducts(response.data.products || []);
        setHasLocation(false);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filters
  const applyFilters = (productList) => {
    let filtered = [...productList];

    // Price filter
    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));

    // Stock filter
    if (inStockOnly) filtered = filtered.filter(p => p.quantity > 0);

    // Distance filter
    if (distanceFilter !== 'all' && hasLocation) {
      const maxDist = Number(distanceFilter);
      filtered = filtered.filter(p => p.distance !== null && p.distance <= maxDist);
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'distance':
      default:
        if (hasLocation) {
          filtered.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
        }
        break;
    }

    return filtered;
  };

  const filteredProducts = applyFilters(products);

  const handleImageError = (e) => {
    if (e.target.src !== defaultImage) e.target.src = defaultImage;
  };

  // Clear all filters
  const clearFilters = () => {
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setDistanceFilter('all');
    setInStockOnly(false);
    setSortBy('distance');
    setSearch('');
  };

  // ========== Horizontal Product Card ==========
  const HorizontalCard = ({ product }) => (
    <div className="h-card" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="h-card-img">
        <img
          src={product.image || defaultImage}
          alt={product.name}
          onError={handleImageError}
        />
      </div>
      <div className="h-card-body">
        <div className="h-card-info">
          <h3>{product.name}</h3>
          <div className="h-card-rating">
            <span className="rating-badge">
              <FiStar size={12} fill="#fff" /> {product.rating || 4.5}
            </span>
            <span className="h-card-category">{product.category}</span>
          </div>
          <ul className="h-card-features">
            <li><FiCheck size={14} /> {product.description?.substring(0, 50)}...</li>
            <li><FiCheck size={14} /> Min Order: {product.minOrderQty?.toLocaleString() || '1,000'} {product.unit}s</li>
            {product.transportAvailable && (
              <li><FiTruck size={14} /> Transport Available</li>
            )}
            <li><FiMapPin size={14} /> {product.sellerCity || product.location}</li>
          </ul>
        </div>
        <div className="h-card-pricing">
          <div className="h-price">₹{product.price?.toLocaleString()}</div>
          <div className="h-unit">per {product.unit}</div>
          <div className={`h-stock ${product.quantity > 0 ? 'in' : 'out'}`}>
            {product.quantity > 0
              ? `✓ ${product.quantity?.toLocaleString()} in stock`
              : '✕ Out of stock'}
          </div>
          <div className="h-seller">{product.sellerName}</div>
          {product.distance !== null && product.distance !== undefined && (
            <div className="h-distance">
              <FiMapPin size={13} /> {product.distanceText}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ========== Grid Product Card ==========
  const GridCard = ({ product }) => (
    <div className="g-card" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="g-card-img">
        <img
          src={product.image || defaultImage}
          alt={product.name}
          onError={handleImageError}
        />
        <span className="g-tag">{product.category}</span>
        {product.distance !== null && product.distance !== undefined && (
          <span className="g-distance">
            <FiMapPin size={11} /> {product.distanceText}
          </span>
        )}
      </div>
      <div className="g-card-body">
        <h3>{product.name}</h3>
        <div className="g-rating">
          <span className="rating-badge">
            <FiStar size={11} fill="#fff" /> {product.rating || 4.5}
          </span>
          <span className="g-location">{product.sellerCity || product.location}</span>
        </div>
        <div className="g-price">₹{product.price?.toLocaleString()} <span>/ {product.unit}</span></div>
        <div className="g-seller">
          {product.sellerName}
        </div>
      </div>
    </div>
  );

  // Loading States
  if (loading && locationStatus === 'detecting') {
    return (
      <div className="products-page">
        <div className="products-loading">
          <FiNavigation size={40} className="detecting-icon" />
          <p>Detecting your location...</p>
          <small>Finding nearest sellers for you</small>
        </div>
      </div>
    );
  }

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
      {/* ========== Top Search Bar ========== */}
      <div className="products-top-bar">
        <h1 className="top-bar-logo">🧱 BrickBazaar</h1>
        <div className="top-bar-search">
          <FiSearch className="top-search-icon" />
          <input
            type="text"
            placeholder="Search for bricks, cement, sand, steel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ========== Location Banner ========== */}
      {locationStatus === 'denied' && (
        <div className="loc-banner denied">
          <div className="loc-banner-left">
            <FiAlertCircle />
            <div>
              <strong>Location access denied</strong>
              <p>Enable location to see nearest sellers</p>
            </div>
          </div>
          <div className="loc-banner-actions">
            <button className="loc-btn" onClick={askForLocation}>
              <FiNavigation /> Try Again
            </button>
            <button className="loc-btn primary" onClick={() => setShowManualInput(!showManualInput)}>
              <FiMapPin /> Enter City
            </button>
          </div>
        </div>
      )}

      {locationStatus === 'granted' && (
        <div className="loc-banner granted">
          <FiNavigation />
          <span>📍 Products sorted by distance from your location</span>
          <button
            className="loc-clear"
            onClick={() => {
              setBuyerLocation({ lat: null, lng: null });
              setLocationStatus('denied');
              setHasLocation(false);
            }}
          >
            <FiX /> Clear
          </button>
        </div>
      )}

      {showManualInput && (
        <div className="manual-input-bar">
          <FiMapPin />
          <input
            type="text"
            placeholder="Enter your city (e.g. Ahmedabad)"
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
          />
          <button className="loc-btn primary" onClick={() => {
            setSearch(manualCity);
            setShowManualInput(false);
          }}>Search</button>
          <button className="loc-btn" onClick={() => setShowManualInput(false)}>Cancel</button>
        </div>
      )}

      {/* ========== Main Layout ========== */}
      <div className="products-layout">
        {/* Sidebar Filters */}
        <aside className={`products-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="clear-filters" onClick={clearFilters}>Clear All</button>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h4>Category</h4>
            {['All', 'Bricks', 'Cement', 'Sand', 'Steel', 'Other'].map(cat => (
              <label key={cat} className="filter-checkbox">
                <input
                  type="radio"
                  name="category"
                  checked={category === cat}
                  onChange={() => setCategory(cat)}
                />
                <span className="checkmark"></span>
                {cat === 'All' ? 'All Categories' : cat}
              </label>
            ))}
          </div>

          {/* Price Filter */}
          <div className="filter-group">
            <h4>Price Range (₹)</h4>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Distance Filter */}
          {hasLocation && (
            <div className="filter-group">
              <h4>Distance</h4>
              {[
                { value: '5', label: 'Within 5 km' },
                { value: '10', label: 'Within 10 km' },
                { value: '50', label: 'Within 50 km' },
                { value: 'all', label: 'All Distances' }
              ].map(opt => (
                <label key={opt.value} className="filter-checkbox">
                  <input
                    type="radio"
                    name="distance"
                    checked={distanceFilter === opt.value}
                    onChange={() => setDistanceFilter(opt.value)}
                  />
                  <span className="checkmark"></span>
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {/* Stock Filter */}
          <div className="filter-group">
            <h4>Availability</h4>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span className="checkmark"></span>
              In Stock Only
            </label>
          </div>
        </aside>

        {/* Products Area */}
        <div className="products-main">
          {/* Results Bar */}
          <div className="results-bar">
            <div className="results-info">
              <span>
                Showing <strong>{filteredProducts.length}</strong> of{' '}
                <strong>{products.length}</strong> products
                {search && <> for "<strong>{search}</strong>"</>}
              </span>
            </div>
            <div className="results-actions">
              {/* Mobile Filter Toggle */}
              <button
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiPackage /> Filters
              </button>

              {/* Sort */}
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="distance">Sort by: Distance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
                <option value="newest">Newest First</option>
              </select>

              {/* View Toggle */}
              <div className="view-toggle">
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <FiList />
                </button>
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <FiPackage size={60} />
              <h3>No Products Found</h3>
              <p>Try adjusting your filters or search criteria</p>
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="products-list">
              {filteredProducts.map(product => (
                <HorizontalCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="products-grid-view">
              {filteredProducts.map(product => (
                <GridCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;