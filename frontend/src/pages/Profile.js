import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Removed: preferences and password management (not supported by backend)

  const saveProfile = async () => {
    try {
      setLoading(true);
      
  const updatedUser = await userService.updateUserProfile(user.id, formData);
      updateUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Removed: changePassword (not implemented in service)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout>
      <motion.div
        className="profile-page"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="page-header" variants={itemVariants}>
          <h1>
            <i className="fas fa-user-cog"></i>
            Profile Settings
          </h1>
        </motion.div>

        <motion.div className="profile-container" variants={itemVariants}>
          {/* Profile Picture Section */}
          <div className="profile-section">
            <div className="profile-picture-section">
              <div className="profile-picture">
                {user?.firstName && (
                  <div className="profile-initials">
                    {user.firstName.charAt(0)}{user.lastName?.charAt(0) || ''}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2>{user?.firstName} {user?.lastName}</h2>
                <p className="role-badge">{user?.role}</p>
                <p className="email-text">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="profile-section">
            <div className="section-header">
              <h3>Basic Information</h3>
              <button
                type="button"
                onClick={() => setEditing(!editing)}
                className="btn btn-secondary btn-sm"
              >
                <i className={`fas fa-${editing ? 'times' : 'edit'}`}></i>
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!editing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!editing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!editing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!editing}
                  className="form-input"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!editing}
                className="form-textarea"
                rows="3"
                placeholder="Tell us about yourself..."
                maxLength="300"
              />
              {editing && (
                <small>{formData.bio.length}/300 characters</small>
              )}
            </div>

            {editing && (
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <div className="spinner small"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          {/* Removed: Preferences, Security, and Danger Zone sections for a compact, supported profile page */}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;
