import React from 'react';

const PageLoader = () => {
  return (
    <div className="page-loader">
      <div className="loader-content">
        <div className="brick-loader">
          <div className="brick brick-1"></div>
          <div className="brick brick-2"></div>
          <div className="brick brick-3"></div>
          <div className="brick brick-4"></div>
        </div>
        <div className="loader-text">
          
          <h2>Brick<span>Bazaar</span></h2>
          
          <div className="loader-bar">
          <span className="loader-logo">A digitlized Platform for </span>
            <div className="loader-bar-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;