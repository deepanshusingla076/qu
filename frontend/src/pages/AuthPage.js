import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthPage = () => {
  // Always default to login tab on mount
  const [isLogin, setIsLogin] = useState(() => true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT'
  });
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Password strength checker
  useEffect(() => {
    if (formData.password.length === 0) {
      setPasswordStrength('');
      return;
    }
    
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[a-z]/.test(formData.password)) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    
    if (strength <= 2) setPasswordStrength('Weak');
    else if (strength <= 3) setPasswordStrength('Medium');
    else setPasswordStrength('Strong');
  }, [formData.password]);

  // Password match checker
  useEffect(() => {
    if (!isLogin) {
      setPasswordMatch(formData.password === formData.confirmPassword || formData.confirmPassword === '');
    }
  }, [formData.password, formData.confirmPassword, isLogin]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Login
        const response = await login({
          usernameOrEmail: formData.username,
          password: formData.password
        });
        if (response) {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // --- Frontend validation for registration fields ---
        // Username: 3-50 chars, letters/numbers/underscores
        if (!/^\w{3,50}$/.test(formData.username)) {
          toast.error('Username must be 3-50 characters and contain only letters, numbers, and underscores.');
          setIsSubmitting(false);
          return;
        }
        // Email: valid, <=100 chars
        if (!/^.{1,100}$/.test(formData.email) || !/^\S+@\S+\.\S+$/.test(formData.email)) {
          toast.error('Please enter a valid email address (max 100 characters).');
          setIsSubmitting(false);
          return;
        }
        // Password: 8-100 chars, at least 1 lowercase, 1 uppercase, 1 digit, 1 special char
        if (!/^.{8,100}$/.test(formData.password) ||
            !/(?=.*[a-z])/.test(formData.password) ||
            !/(?=.*[A-Z])/.test(formData.password) ||
            !/(?=.*\d)/.test(formData.password) ||
            !/(?=.*[@$!%*?&])/.test(formData.password)) {
          toast.error('Password must be 8-100 characters and include lowercase, uppercase, digit, and special character.');
          setIsSubmitting(false);
          return;
        }
        // First name: not blank, <=50 chars
        if (!formData.firstName.trim() || formData.firstName.length > 50) {
          toast.error('First name is required and must not exceed 50 characters.');
          setIsSubmitting(false);
          return;
        }
        // Last name: not blank, <=50 chars
        if (!formData.lastName.trim() || formData.lastName.length > 50) {
          toast.error('Last name is required and must not exceed 50 characters.');
          setIsSubmitting(false);
          return;
        }
        // Role: STUDENT or TEACHER
        if (!['STUDENT', 'TEACHER'].includes(formData.role)) {
          toast.error('Role must be either Student or Teacher.');
          setIsSubmitting(false);
          return;
        }
        // Password match
        if (!passwordMatch) {
          toast.error('Passwords do not match!');
          setIsSubmitting(false);
          return;
        }
        if (passwordStrength === 'Weak') {
          toast.error('Please use a stronger password!');
          setIsSubmitting(false);
          return;
        }

        const response = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role
        });
        if (response) {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'STUDENT'
    });
  };

  return (
    <div className="auth-page">
      {/* Compact Navbar */}
      <nav className="auth-navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <i className="fas fa-brain"></i>
            QWIZZ
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <i className="fas fa-home"></i>
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Compact Auth Container */}
      <div className="auth-container compact">
        <div className="auth-card compact">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form compact">
            <h2 className="auth-title">
              {isLogin ? 'Welcome Back!' : 'Join QWIZZ'}
            </h2>
            <p className="auth-subtitle">
              {isLogin
                ? 'Sign in to your account'
                : 'Create your account to get started'
              }
            </p>

            {!isLogin && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="form-input"
                    placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="form-input"
                    placeholder="Last name"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="form-input"
                  placeholder="your@email.com"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Password"
              />
              {!isLogin && formData.password && (
                <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
                  <span className="strength-text">Strength: {passwordStrength}</span>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className={`form-input ${!passwordMatch ? 'error' : ''}`}
                  placeholder="Confirm password"
                />
                {!passwordMatch && formData.confirmPassword && (
                  <span className="error-text">Passwords don't match</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!isLogin && !passwordMatch)}
              className={`auth-submit-btn ${isSubmitting ? 'submitting' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  <i className={`fas fa-${isLogin ? 'sign-in-alt' : 'user-plus'}`}></i>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="auth-toggle-btn"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;