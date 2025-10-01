import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = ({ activeSection, onNavigate }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const handleNavigate = (section) => {
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(section);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="nav-brand">
            <i className="fas fa-brain"></i>
            QWIZZ
          </Link>
        </div>

        <div className={`nav-menu ${menuOpen ? "active" : ""}`} id="nav-menu">
          <Link 
            to="/"
            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigate('home')}
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              {user?.role === 'TEACHER' && (
                <>
                  <Link to="/quiz/create" className="nav-link">
                    Create Quiz
                  </Link>
                  <Link to="/quiz/ai-generate" className="nav-link">
                    AI Generator
                  </Link>
                </>
              )}

              <div className="nav-dropdown">
                <button className="nav-link dropdown-trigger">
                  <i className="fas fa-user"></i>
                  <span>{user?.firstName || user?.username}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    Profile
                  </Link>
                  {user?.role === 'STUDENT' && (
                    <Link to="/student/dashboard" className="dropdown-item">
                      My Attempts
                    </Link>
                  )}
                  {user?.role === 'TEACHER' && (
                    <>
                      <Link to="/teacher/dashboard" className="dropdown-item">
                        My Quizzes
                      </Link>
                      <Link to="/analytics" className="dropdown-item">
                        Analytics
                      </Link>
                    </>
                  )}
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="nav-link">
                Login
              </Link>
              <Link to="/auth" className="btn btn-get-started nav-register-btn">
                <i className="fas fa-user-plus"></i>
                Register
              </Link>
            </>
          )}
        </div>

        <div
          className="nav-toggle"
          id="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;