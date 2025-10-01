import React from 'react';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <h1 className="not-found-title">
            <span className="accent">404</span>
          </h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <div className="not-found-actions">
            <a href="/" className="btn btn-primary btn-large">
              <i className="fas fa-home"></i>
              Go Home
            </a>
            <a href="/auth" className="btn btn-secondary btn-large">
              <i className="fas fa-sign-in-alt"></i>
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;