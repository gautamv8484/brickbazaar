import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiMessageSquare, FiCheckCircle, FiStar, FiUser } from 'react-icons/fi';
import {
  FiShoppingCart,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiShield,
  FiHeadphones,
  FiDollarSign,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const Home = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Bricks",
      desc: "Red bricks, fly ash, AAC blocks",
      image:
        "https://images.unsplash.com/photo-1590075865003-e48277faa558?w=600",
      sellers: 150,
      products: 2000,
    },
    {
      name: "Cement",
      desc: "OPC, PPC, and specialty cements",
      image:
        "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600",
      sellers: 80,
      products: 500,
    },
    {
      name: "Sand",
      desc: "River sand, M-sand, gravel",
      image:
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600",
      sellers: 100,
      products: 300,
    },
    {
      name: "Steel",
      desc: "TMT bars, structural steel",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      sellers: 70,
      products: 450,
    },
  ];

  const features = [
    {
      icon: <FiCheckCircle />,
      title: "Verified Sellers",
      desc: "All sellers are verified for quality assurance.",
    },
    {
      icon: <FiDollarSign />,
      title: "Best Prices",
      desc: "Compare prices from multiple sellers.",
    },
    {
      icon: <FiTruck />,
      title: "Easy Transport",
      desc: "Reliable delivery to your construction site.",
    },
    {
      icon: <FiMapPin />,
      title: "Nearby Sellers",
      desc: "Find suppliers near your location.",
    },
    {
      icon: <FiHeadphones />,
      title: "24/7 Support",
      desc: "Round the clock customer support.",
    },
    {
      icon: <FiShield />,
      title: "Secure Payments",
      desc: "Safe and transparent transactions.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              ⚡ India's #1 Construction Marketplace
            </div>
            <h1>
              Build Your Dreams with{" "}
              <span className="highlight">BrickBazaar</span>
            </h1>
            <p>
              Connect directly with verified suppliers of bricks, cement, sand,
              steel and more. Get best prices and materials delivered to your
              doorstep.
            </p>

            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary btn-lg">
                <FiShoppingCart /> Explore Materials
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                Get Started <FiArrowRight />
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <h3>
                  500<span>+</span>
                </h3>
                <p>Verified Sellers</p>
              </div>
              <div className="hero-stat">
                <h3>
                  10K<span>+</span>
                </h3>
                <p>Products</p>
              </div>
              <div className="hero-stat">
                <h3>
                  50K<span>+</span>
                </h3>
                <p>Customers</p>
              </div>
            </div>
          </div>

          {/* Role Selection Card */}
          <div className="hero-card">
            <h2>👋 Welcome to BrickBazaar</h2>
            <p>Choose how you want to use our platform</p>

            <div className="role-options">
              <div
                className="role-card buyer"
                onClick={() => navigate("/register?role=buyer")}
              >
                <div className="role-icon">
                  <FiShoppingCart size={24} />
                </div>
                <div className="role-info">
                  <h3>I'm a Buyer</h3>
                  <p>Buy construction materials at best prices</p>
                </div>
                <FiArrowRight className="role-arrow" />
              </div>

              <div
                className="role-card seller"
                onClick={() => navigate("/register?role=seller")}
              >
                <div className="role-icon">
                  <FiPackage size={24} />
                </div>
                <div className="role-info">
                  <h3>I'm a Seller</h3>
                  <p>Sell your materials to thousands of buyers</p>
                </div>
                <FiArrowRight className="role-arrow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="section-header">
          <div className="section-tag">
            <FiPackage /> Browse Materials
          </div>
          <h2>Popular Categories</h2>
          <p>
            Find the best quality construction materials from verified suppliers
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((cat, i) => (
            <div
              className="category-card"
              key={i}
              onClick={() => navigate("/products")}
            >
              <div className="category-image">
                <img src={cat.image} alt={cat.name} />
                <div className="category-overlay">
                  <div className="category-icon">
                    <FiPackage />
                  </div>
                </div>
              </div>
              <div className="category-content">
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <div className="category-stats">
                  <span>
                    <FiPackage size={14} /> {cat.sellers}+ Sellers
                  </span>
                  <span>
                    <FiShoppingCart size={14} /> {cat.products}+ Products
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <div className="section-tag">
            <FiCheckCircle /> Simple Process
          </div>
          <h2>How It Works</h2>
          <p>Get your construction materials in 3 easy steps</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">
              <FiSearch size={32} />
            </div>
            <h3>Search & Browse</h3>
            <p>
              Find quality materials from verified sellers near your location
            </p>
          </div>

          <div className="step-connector"></div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">
              <FiMessageSquare size={32} />
            </div>
            <h3>Connect & Negotiate</h3>
            <p>Chat with sellers, compare prices, and finalize your deal</p>
          </div>

          <div className="step-connector"></div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">
              <FiTruck size={32} />
            </div>
            <h3>Order & Deliver</h3>
            <p>Place your order and get materials delivered to your site</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <div className="section-tag">
            <FiCheckCircle /> Why Choose Us
          </div>
          <h2>The BrickBazaar Advantage</h2>
          <p>We make buying construction materials simple and reliable</p>
        </div>

        <div className="features-grid">
          {features.map((feat, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{feat.icon}</div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Build Your Dream?</h2>
          <p>
            Join thousands of builders and contractors who trust BrickBazaar
          </p>
          <div className="cta-buttons">
            <Link to="/register?role=buyer" className="btn btn-white btn-lg">
              <FiShoppingCart /> Start Buying
            </Link>
            <Link to="/register?role=seller" className="btn btn-outline btn-lg">
              <FiPackage /> Become a Seller
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
