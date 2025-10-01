import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';
import resultService from '../services/resultService';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import '../styles/Analytics.css';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [analytics, setAnalytics] = useState({
    overview: {
      totalQuizzes: 0,
      totalAttempts: 0,
      totalStudents: 0,
      averageScore: 0
    },
    quizPerformance: [],
    studentActivity: [],
    categoryBreakdown: [],
    recentActivity: []
  });

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch real analytics data from backend
      const analyticsData = await resultService.getUserStatistics(user.id);
      const quizzes = await quizService.getQuizzesByUser(user.id);
      
      setAnalytics({
        overview: {
          totalQuizzes: quizzes?.length || 0,
          totalAttempts: analyticsData?.totalAttempts || 0,
          totalStudents: analyticsData?.totalStudents || 0,
          averageScore: analyticsData?.averageScore || 0
        },
        quizPerformance: analyticsData?.quizPerformance || [],
        studentActivity: analyticsData?.studentActivity || [],
        categoryBreakdown: analyticsData?.categoryBreakdown || [],
        recentActivity: analyticsData?.recentActivity || []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data. Please ensure backend services are running.');
    } finally {
      setLoading(false);
    }
  }, [user, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'easy';
      case 'MEDIUM': return 'medium';
      case 'HARD': return 'hard';
      default: return 'medium';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner text="Loading analytics..." />
      </DashboardLayout>
    );
  }

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
        className="analytics-page"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="page-header" variants={itemVariants}>
          <div className="header-content">
            <h1>
              <i className="fas fa-chart-bar"></i>
              Analytics Dashboard
            </h1>
            <p>Track quiz performance and student engagement</p>
          </div>
          <div className="header-actions">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-select"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div className="overview-stats" variants={itemVariants}>
          <h2>Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon quiz">
                <i className="fas fa-list-alt"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">{analytics.overview.totalQuizzes}</div>
                <div className="stat-label">Total Quizzes</div>
                <div className="stat-change positive">Updated monthly</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon attempts">
                <i className="fas fa-play-circle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">{analytics.overview.totalAttempts}</div>
                <div className="stat-label">Total Attempts</div>
                <div className="stat-change positive">Updated weekly</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon students">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">{analytics.overview.totalStudents}</div>
                <div className="stat-label">Active Students</div>
                <div className="stat-change positive">Updated weekly</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon score">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">{analytics.overview.averageScore}%</div>
                <div className="stat-label">Average Score</div>
                <div className="stat-change positive">Updated monthly</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="analytics-content">
          {/* Quiz Performance */}
          <motion.div className="quiz-performance" variants={itemVariants}>
            <div className="section-header">
              <h2>Quiz Performance</h2>
              <button className="btn btn-secondary btn-sm">
                <i className="fas fa-download"></i>
                Export Report
              </button>
            </div>

            <div className="performance-table">
              <table>
                <thead>
                  <tr>
                    <th>Quiz Title</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Attempts</th>
                    <th>Avg Score</th>
                    <th>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.quizPerformance.map((quiz) => (
                    <tr key={quiz.id}>
                      <td>
                        <div className="quiz-title">{quiz.title}</div>
                      </td>
                      <td>
                        <span className="category-badge">
                          {quiz.category ? quiz.category.replace('_', ' ') : 'General'}
                        </span>
                      </td>
                      <td>
                        <span className={`difficulty-badge ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                      </td>
                      <td>{quiz.attempts}</td>
                      <td>
                        <span className={`score-text ${getScoreColor(quiz.averageScore)}`}>
                          {quiz.averageScore}%
                        </span>
                      </td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${quiz.completionRate}%` }}
                          ></div>
                          <span className="progress-text">{quiz.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div className="category-breakdown" variants={itemVariants}>
            <div className="section-header">
              <h2>Category Performance</h2>
            </div>

            <div className="categories-grid">
              {analytics.categoryBreakdown.map((category) => (
                <div key={category.category} className="category-card">
                  <div className="category-header">
                    <h3>{category.category.replace('_', ' ')}</h3>
                    <span className="quiz-count">{category.count} quizzes</span>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-label">Average Score</span>
                      <span className={`stat-value ${getScoreColor(category.averageScore)}`}>
                        {category.averageScore}%
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Attempts</span>
                      <span className="stat-value">{category.totalAttempts}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Student Activity */}
          <motion.div className="student-activity" variants={itemVariants}>
            <div className="section-header">
              <h2>Recent Student Activity</h2>
              <a href="/students" className="btn btn-secondary btn-sm">
                View All Students
              </a>
            </div>

            <div className="activity-list">
              {analytics.studentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <i className={`fas fa-${activity.action === 'completed' ? 'check-circle' : 'play-circle'}`}></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{activity.student}</strong> {activity.action} 
                      <span className="quiz-name">{activity.quiz}</span>
                      {activity.score && (
                        <span className={`score-badge ${getScoreColor(activity.score)}`}>
                          {activity.score}%
                        </span>
                      )}
                    </div>
                    <div className="activity-time">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div className="recent-activity" variants={itemVariants}>
            <div className="section-header">
              <h2>Recent Activity</h2>
            </div>

            <div className="activity-timeline">
              {analytics.recentActivity.map((activity) => (
                <div key={activity.id} className="timeline-item">
                  <div className={`timeline-icon ${activity.type}`}>
                    <i className={`fas fa-${activity.type === 'quiz' ? 'list-alt' : 'user'}`}></i>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-text">{activity.action}</div>
                    <div className="timeline-time">{formatDate(activity.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Analytics;
