import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary btn-lg">
          <FiArrowLeft /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;