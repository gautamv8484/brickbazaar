import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMail, FiPhone, FiMapPin, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Mock submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1>Contact <span>Us</span></h1>
        <p>Have questions? We'd love to hear from you. Send us a message!</p>
      </section>

      <section className="contact-content">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          <p>We're here to help with any questions about our platform.</p>

          <div className="contact-details">
            <div className="contact-item">
              <div className="contact-icon">
                <FiMapPin />
              </div>
              <div className="contact-text">
                <h4>Address</h4>
                <p>123 Business Park, Gandhinagar, Gujarat 382010</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <FiPhone />
              </div>
              <div className="contact-text">
                <h4>Phone</h4>
                <p>+91 98765 43210</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <FiMail />
              </div>
              <div className="contact-text">
                <h4>Email</h4>
                <p>support@brickbazaar.com</p>
              </div>
            </div>
          </div>

          <div className="contact-hours">
            <h4>Business Hours</h4>
            <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label><FiUser /> Your Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><FiMail /> Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><FiMessageSquare /> Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="What is this about?"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><FiMessageSquare /> Message</label>
              <textarea
                name="message"
                placeholder="Write your message here..."
                value={form.message}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              <FiSend /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;