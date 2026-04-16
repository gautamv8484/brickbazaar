import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiTarget, 
  FiUsers, 
  FiAward, 
  FiTruck, 
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiZap,
  FiHeart,
  FiMapPin,
  FiDollarSign,
  FiPackage,
  FiStar
} from 'react-icons/fi';

const About = () => {
  const statsRef = useRef(null);

  // Animate stats counting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.counter-value');
            counters.forEach((counter) => {
              const target = parseInt(counter.getAttribute('data-target'));
              let current = 0;
              const increment = Math.ceil(target / 60);
              const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                  current = target;
                  clearInterval(timer);
                }
                counter.textContent = current.toLocaleString();
              }, 30);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-modern">

      {/* ========== Hero ========== */}
      <section className="about-hero-modern">
        <div className="about-hero-bg">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
        <div className="about-hero-inner">
          <span className="about-badge">🧱 About BrickBazaar</span>
          <h1>
            Building India's Largest
            <br />
            <span className="gradient-text">Construction Marketplace</span>
          </h1>
          <p>
            We're on a mission to transform how India buys construction materials.
            Connecting verified sellers with buyers for a transparent, fast, and reliable experience.
          </p>
          <div className="about-hero-btns">
            <Link to="/products" className="btn-modern primary">
              Explore Products <FiArrowRight />
            </Link>
            <Link to="/register" className="btn-modern outline">
              Join Now
            </Link>
          </div>
        </div>
      </section>

      {/* ========== Stats Counter ========== */}
      <section className="about-stats-modern" ref={statsRef}>
        <div className="stats-modern-grid">
          <div className="stat-modern">
            <div className="stat-modern-icon purple">
              <FiUsers />
            </div>
            <h3><span className="counter-value" data-target="50000">0</span>+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-modern">
            <div className="stat-modern-icon orange">
              <FiAward />
            </div>
            <h3><span className="counter-value" data-target="500">0</span>+</h3>
            <p>Verified Sellers</p>
          </div>
          <div className="stat-modern">
            <div className="stat-modern-icon green">
              <FiTruck />
            </div>
            <h3><span className="counter-value" data-target="10000">0</span>+</h3>
            <p>Orders Delivered</p>
          </div>
          <div className="stat-modern">
            <div className="stat-modern-icon blue">
              <FiMapPin />
            </div>
            <h3><span className="counter-value" data-target="50">0</span>+</h3>
            <p>Cities Covered</p>
          </div>
        </div>
      </section>

      {/* ========== Story Section ========== */}
      <section className="about-story">
        <div className="story-content">
          <div className="story-images">
            <div className="story-img-main">
              <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600" alt="Construction" />
            </div>
            <div className="story-img-float">
              <img src="https://images.unsplash.com/photo-1590075865003-e48277faa558?w=400" alt="Bricks" />
            </div>
            <div className="story-experience">
              <h3>5+</h3>
              <p>Years of<br/>Experience</p>
            </div>
          </div>
          <div className="story-text">
            <span className="section-label">Our Story</span>
            <h2>From a Simple Idea to India's Trusted Platform</h2>
            <p>
              BrickBazaar started with a simple observation — buying construction materials 
              was unnecessarily complicated. Builders spent hours visiting multiple dealers, 
              comparing prices, and arranging transport.
            </p>
            <p>
              We built a platform where everything happens in one place. Browse thousands 
              of products, compare prices from verified sellers, and get materials delivered 
              to your site — all from your phone.
            </p>
            <div className="story-highlights">
              <div className="highlight-item">
                <FiCheckCircle />
                <span>100% Verified Sellers</span>
              </div>
              <div className="highlight-item">
                <FiCheckCircle />
                <span>Transparent Pricing</span>
              </div>
              <div className="highlight-item">
                <FiCheckCircle />
                <span>Direct Communication</span>
              </div>
              <div className="highlight-item">
                <FiCheckCircle />
                <span>Pan India Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Features Grid ========== */}
      <section className="about-features-modern">
        <div className="features-modern-header">
          <span className="section-label">Why BrickBazaar</span>
          <h2>Everything You Need in One Place</h2>
          <p>We've designed every feature keeping builders and suppliers in mind</p>
        </div>
        <div className="features-modern-grid">
          <div className="feature-modern-card">
            <div className="fmc-icon orange"><FiShield /></div>
            <h3>Verified & Trusted</h3>
            <p>Every seller goes through strict verification. Quality guaranteed on every order.</p>
          </div>
          <div className="feature-modern-card">
            <div className="fmc-icon blue"><FiDollarSign /></div>
            <h3>Best Prices</h3>
            <p>Compare prices from multiple sellers. Get the best deal every single time.</p>
          </div>
          <div className="feature-modern-card">
            <div className="fmc-icon green"><FiTruck /></div>
            <h3>Easy Transport</h3>
            <p>Auto vehicle suggestion based on your order. Door-to-door delivery available.</p>
          </div>
          <div className="feature-modern-card">
            <div className="fmc-icon purple"><FiMapPin /></div>
            <h3>Nearby Sellers</h3>
            <p>Find sellers near you automatically. Sorted by distance for fastest delivery.</p>
          </div>
          <div className="feature-modern-card">
            <div className="fmc-icon red"><FiZap /></div>
            <h3>Instant Orders</h3>
            <p>Place orders in minutes. Seller gets notified immediately with your details.</p>
          </div>
          <div className="feature-modern-card">
            <div className="fmc-icon teal"><FiPackage /></div>
            <h3>Wide Selection</h3>
            <p>Bricks, cement, sand, steel & more. Everything for your construction needs.</p>
          </div>
        </div>
      </section>

      {/* ========== How It Works ========== */}
      <section className="about-process">
        <div className="process-header">
          <span className="section-label">How It Works</span>
          <h2>Simple Steps to Get Started</h2>
        </div>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-num">01</div>
            <div className="step-content">
              <h3>Create Account</h3>
              <p>Sign up as a buyer or seller in just 30 seconds. No paperwork needed.</p>
            </div>
          </div>
          <div className="process-connector"></div>
          <div className="process-step">
            <div className="step-num">02</div>
            <div className="step-content">
              <h3>Browse & Compare</h3>
              <p>Search products, compare prices, and find the nearest sellers to your location.</p>
            </div>
          </div>
          <div className="process-connector"></div>
          <div className="process-step">
            <div className="step-num">03</div>
            <div className="step-content">
              <h3>Place Order</h3>
              <p>Select quantity, choose transport option, and confirm your order instantly.</p>
            </div>
          </div>
          <div className="process-connector"></div>
          <div className="process-step">
            <div className="step-num">04</div>
            <div className="step-content">
              <h3>Get Delivered</h3>
              <p>Track your order and receive materials at your construction site.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Testimonials ========== */}
      <section className="about-reviews">
        <div className="reviews-header">
          <span className="section-label">Testimonials</span>
          <h2>What Our Users Say</h2>
        </div>
        <div className="reviews-grid">
          <div className="review-card">
            <div className="review-stars">
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
            </div>
            <p>"Found quality bricks at 20% less than market price. Delivery was on time. Highly recommended!"</p>
            <div className="review-author">
              <div className="review-avatar buyer">RP</div>
              <div>
                <h4>Rajesh Patel</h4>
                <span>Contractor, Ahmedabad</span>
              </div>
            </div>
          </div>
          <div className="review-card">
            <div className="review-stars">
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
            </div>
            <p>"My sales increased 3x after joining. The platform connects me with genuine buyers daily."</p>
            <div className="review-author">
              <div className="review-avatar seller">PS</div>
              <div>
                <h4>Priya Sharma</h4>
                <span>Brick Supplier, Surat</span>
              </div>
            </div>
          </div>
          <div className="review-card">
            <div className="review-stars">
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
              <FiStar fill="#f59e0b" stroke="#f59e0b" />
            </div>
            <p>"Transport feature saved us so much hassle. Vehicle suggestion based on quantity is genius!"</p>
            <div className="review-author">
              <div className="review-avatar buyer">AM</div>
              <div>
                <h4>Amit Mehta</h4>
                <span>Builder, Vadodara</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="about-cta-modern">
        <div className="cta-modern-bg">
          <div className="cta-shape cta-shape-1"></div>
          <div className="cta-shape cta-shape-2"></div>
        </div>
        <div className="cta-modern-inner">
          <h2>Ready to Transform Your Construction Business?</h2>
          <p>Join thousands of builders and suppliers who trust BrickBazaar</p>
          <div className="cta-modern-btns">
            <Link to="/register?role=buyer" className="btn-modern white">
              <FiHeart /> Start Buying
            </Link>
            <Link to="/register?role=seller" className="btn-modern glass">
              <FiPackage /> Become a Seller
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;