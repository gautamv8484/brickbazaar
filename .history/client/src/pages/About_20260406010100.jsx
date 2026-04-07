import React from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiUsers, FiAward, FiTruck, FiArrowRight } from 'react-icons/fi';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About <span>BrickBazaar</span></h1>
          <p>India's most trusted construction materials marketplace connecting builders with verified suppliers.</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="mission-content">
          <div className="mission-text">
            <h2>Our Mission</h2>
            <p>
              To revolutionize the construction materials industry by creating a transparent, 
              efficient, and reliable marketplace where buyers can find quality materials 
              at the best prices, and sellers can reach thousands of potential customers.
            </p>
            <Link to="/register" className="btn btn-primary">
              Join Us Today <FiArrowRight />
            </Link>
          </div>
          <div className="mission-image">
            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600" alt="Construction" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <FiUsers className="stat-icon" />
            <h3>50,000+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-item">
            <FiAward className="stat-icon" />
            <h3>500+</h3>
            <p>Verified Sellers</p>
          </div>
          <div className="stat-item">
            <FiTruck className="stat-icon" />
            <h3>10,000+</h3>
            <p>Deliveries Made</p>
          </div>
          <div className="stat-item">
            <FiTarget className="stat-icon" />
            <h3>50+</h3>
            <p>Cities Covered</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-why">
        <h2>Why Choose BrickBazaar?</h2>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-number">01</div>
            <h3>Verified Sellers</h3>
            <p>All our sellers go through strict verification to ensure quality and reliability.</p>
          </div>
          <div className="why-card">
            <div className="why-number">02</div>
            <h3>Best Prices</h3>
            <p>Compare prices from multiple sellers and get the best deals on materials.</p>
          </div>
          <div className="why-card">
            <div className="why-number">03</div>
            <h3>Wide Selection</h3>
            <p>From bricks to steel, find all construction materials in one place.</p>
          </div>
          <div className="why-card">
            <div className="why-number">04</div>
            <h3>Easy Process</h3>
            <p>Simple ordering process with direct communication between buyers and sellers.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of satisfied customers and trusted sellers.</p>
        <div className="cta-buttons">
          <Link to="/register?role=buyer" className="btn btn-primary btn-lg">Start Buying</Link>
          <Link to="/register?role=seller" className="btn btn-outline btn-lg">Start Selling</Link>
        </div>
      </section>
    </div>
  );
};

export default About;