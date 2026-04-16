import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { 
  FiSearch, 
  FiFilter, 
  FiMapPin, 
  FiStar, 
  FiPackage,
  FiNavigation,
  FiAlertCircle
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

  // Location states
  const [buyerLocation, setBuyerLocation] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState('idle');
  // idle | detecting | granted | denied | manual
  const [manualCity, setManualCity] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Default image
  const defaultImage = 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=400';

  // ========== On Mount: Ask for Location ==========
  useEffect(() => {
    askForLocation();
  }, []);

  // ========== Fetch when location or filters change ==========
  useEffect(() => {
    fetchProducts();
  }, [buyerLocation, search, category]);

  // ========== Ask Browser for Location ==========
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
        console.log('📍 Buyer location:', latitude, longitude);
        
        setBuyerLocation({ lat: latitude, lng: longitude });
        setLocationStatus('granted');
      },
      (error) => {
        console.log('❌ Location denied:', error.message);
        setLocationStatus('denied');
        fetchProducts(); // Fetch without location
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );
  };

  // ========== Fetch Products from API ==========
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products...');

      // Build params
      const params = {};
      if (buyerLocation.lat && buyerLocation.lng) {
        params.lat = buyerLocation.lat;
        params.lng = buyerLocation.lng;
      }
      if (search) params.search = search;
      if (category !== 'All') params.category = category;

      const response = await productAPI.getAllWithLocation(params);
      console.log('📦 Products response:', response.data);

      if (response.data.hasLocation) {
        // Location-based grouped response
        setGroups(response.data.groups || { nearYou: [], nearby: [], others: [] });
        setProducts(response.data.products || []);
        setHasLocation(true);
      } else {
        // No location - flat list
        setProducts(response.data.products || []);
        setHasLocation(false);
      }

      setError(null);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Handle image error
  const handleImageError = (e) => {
    if (e.target.src !== defaultImage) e.target.src = defaultImage;
  };

  // ========== Product Card Component ==========
  const ProductCard = ({ product }) => (
    <div 
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
        {/* Distance Badge */}
        {product.distance !== null && product.distance !== undefined && (
          <span className="distance-badge">
            <FiMapPin size={12} />
            {product.distanceText}
          </span>
        )}
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
            {product.sellerCity || product.location}
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
            {product.quantity > 0 ? `${product.quantity?.toLocaleString()} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="product-seller">
          Sold by: <strong>{product.sellerName}</strong>
          {product.sellerCity && (
            <span className="seller-city"> • {product.sellerCity}</span>
          )}
        </div>
      </div>
    </div>
  );

  // ========== Section Header ==========
  const SectionHeader = ({ icon, title, count, color }) => (
    <div className={`location-section-header ${color}`}>
      <span className="section-icon">{icon}</span>
      <h2>{title}</h2>
      <span className="section-count">{count} products</span>
    </div>
  );

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
      {/* Header */}
      <div className="products-header">
        <h1>🧱 All Products</h1>
        <p>Browse quality construction materials from verified sellers</p>
      </div>

      {/* ========== Location Banner ========== */}
      {locationStatus === 'denied' && (
        <div className="location-banner denied">
          <div className="location-banner-content">
            <FiAlertCircle />
            <div>
              <strong>Location access denied</strong>
              <p>Enable location to see nearest sellers first</p>
            </div>
          </div>
          <div className="location-banner-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={askForLocation}
            >
              <FiNavigation /> Try Again
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowManualInput(!showManualInput)}
            >
              <FiMapPin /> Enter City
            </button>
          </div>
        </div>
      )}

      {locationStatus === 'granted' && (
        <div className="location-banner granted">
          <FiNavigation />
          <span>📍 Showing products sorted by distance from your location</span>
          <button 
            className="btn btn-sm location-clear-btn"
            onClick={() => {
              setBuyerLocation({ lat: null, lng: null });
              setLocationStatus('denied');
              setHasLocation(false);
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Manual City Input */}
      {showManualInput && (
        <div className="manual-location-input">
          <FiMapPin />
          <input
            type="text"
            placeholder="Enter your city name (e.g. Ahmedabad)"
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
          />
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              // For now, just filter by city name
              setSearch(manualCity);
              setShowManualInput(false);
              toast.success(`Showing sellers in ${manualCity}`);
            }}
          >
            Search
          </button>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowManualInput(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ========== Filters ========== */}
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

      {/* ========== Products Display ========== */}
      <div className="products-content">
        
        {/* Location-based grouped view */}
        {hasLocation ? (
          <>
            {/* Near You (0-5km) */}
            {groups.nearYou?.length > 0 && (
              <div className="location-group">
                <SectionHeader 
                  icon="📍" 
                  title="Near You (0-5 km)" 
                  count={groups.nearYou.length}
                  color="near"
                />
                <div className="products-grid">
                  {groups.nearYou.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Nearby (5-10km) */}
            {groups.nearby?.length > 0 && (
              <div className="location-group">
                <SectionHeader 
                  icon="🗺️" 
                  title="Nearby (5-10 km)" 
                  count={groups.nearby.length}
                  color="nearby"
                />
                <div className="products-grid">
                  {groups.nearby.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Other Sellers (10km+) */}
            {groups.others?.length > 0 && (
              <div className="location-group">
                <SectionHeader 
                  icon="🌍" 
                  title="Other Sellers (10+ km)" 
                  count={groups.others.length}
                  color="others"
                />
                <div className="products-grid">
                  {groups.others.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* No products at all */}
            {groups.nearYou?.length === 0 && 
             groups.nearby?.length === 0 && 
             groups.others?.length === 0 && (
              <div className="no-products">
                <FiPackage size={60} />
                <h3>No Products Found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        ) : (
          /* No location - flat list */
          <>
            <div className="products-count">
              <p>Showing <strong>{products.length}</strong> products</p>
            </div>

            {products.length === 0 ? (
              <div className="no-products">
                <FiPackage size={60} />
                <h3>No Products Found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;