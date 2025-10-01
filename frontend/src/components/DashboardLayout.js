import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <Navigation />
      
      <main className="dashboard-main">
        <div className="dashboard-container">
          {children}
        </div>
      </main>

      {/* Floating Action Button for Quick Quiz Creation (Teachers) */}
      {user && user.role === 'TEACHER' && (
        <motion.div className="fab-container">
          <motion.div
            className="fab"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/quiz/create" className="fab-link">
              <i className="fas fa-plus"></i>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardLayout;