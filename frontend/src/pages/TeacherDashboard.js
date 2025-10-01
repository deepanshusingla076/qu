import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';
import resultService from '../services/resultService';
import DashboardLayout from '../components/DashboardLayout';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    activeQuizzes: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch user's quizzes
      let userQuizzes = [];
      try {
        const quizzesResponse = await quizService.getQuizzesByUser(user.id);
        
        // Handle various response formats
        if (Array.isArray(quizzesResponse)) {
          userQuizzes = quizzesResponse;
        } else if (quizzesResponse && Array.isArray(quizzesResponse.content)) {
          userQuizzes = quizzesResponse.content;
        } else if (quizzesResponse && quizzesResponse.data && Array.isArray(quizzesResponse.data)) {
          userQuizzes = quizzesResponse.data;
        } else {
          userQuizzes = [];
        }
        
        // Ensure each quiz has required fields
        userQuizzes = userQuizzes.map(quiz => ({
          ...quiz,
          totalQuestions: quiz.totalQuestions || quiz.questionCount || 0,
          isActive: quiz.isActive !== undefined ? quiz.isActive : (quiz.active !== undefined ? quiz.active : true),
          timeLimit: quiz.timeLimit || 30,
          difficulty: quiz.difficulty || 'MEDIUM'
        }));
        
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast.error(`Failed to load quizzes: ${error.message}`);
        userQuizzes = [];
      }
      
      setQuizzes(userQuizzes);

      // Calculate stats
      const totalQuizzes = userQuizzes.length;
      const activeQuizzes = userQuizzes.filter(quiz => quiz.active || quiz.isActive).length;
      
      // Fetch attempts and scores for each quiz
      let totalAttempts = 0;
      let averageScore = 0;

      try {
        let totalScores = 0;
        let totalScoreCount = 0;

        for (const quiz of userQuizzes) {
          try {
            const quizStats = await resultService.getQuizStatistics(quiz.id);
            totalAttempts += quizStats.totalAttempts || 0;
            if (quizStats.averageScore) {
              totalScores += quizStats.averageScore;
              totalScoreCount++;
            }
          } catch (error) {
            console.warn(`Could not fetch stats for quiz ${quiz.id}:`, error);
          }
        }

        averageScore = totalScoreCount > 0 ? Math.round(totalScores / totalScoreCount) : 0;
      } catch (error) {
        console.error('Error calculating statistics:', error);
        totalAttempts = 0;
        averageScore = 0;
      }

      setStats({
        totalQuizzes,
        totalAttempts,
        averageScore,
        activeQuizzes
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await quizService.deleteQuiz(quizId);
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        toast.success('Quiz deleted successfully');
        // Refresh stats
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting quiz:', error);
        toast.error(`Failed to delete quiz: ${error.message || 'Unknown error'}`);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout>
      <motion.div
        className="teacher-dashboard"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="dashboard-header" variants={itemVariants}>
          <h1>Welcome back, <span className="accent">{user.firstName}</span>!</h1>
          <p>Manage your quizzes, track student progress, and analyze performance</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div className="stats-grid" variants={itemVariants}>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-list-alt"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalQuizzes}</div>
              <div className="stat-label">Total Quizzes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-play-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.activeQuizzes}</div>
              <div className="stat-label">Active Quizzes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalAttempts}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.averageScore}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="quick-actions" variants={itemVariants}>
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <motion.div className="action-card create" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/quiz/create" className="action-link">
                <div className="action-icon"><i className="fas fa-plus"></i></div>
                <div className="action-content">
                  <h3>Create Quiz</h3>
                  <p>Build a custom quiz manually</p>
                </div>
              </Link>
            </motion.div>
            <motion.div className="action-card ai-generate" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/quiz/ai-generate" className="action-link">
                <div className="action-icon"><i className="fas fa-robot"></i></div>
                <div className="action-content">
                  <h3>AI Generate</h3>
                  <p>Let AI create quiz questions</p>
                </div>
              </Link>
            </motion.div>
            <motion.div className="action-card analytics" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/analytics" className="action-link">
                <div className="action-icon"><i className="fas fa-chart-bar"></i></div>
                <div className="action-content">
                  <h3>Analytics</h3>
                  <p>View performance insights</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Quizzes */}
        <motion.div className="recent-quizzes" variants={itemVariants}>
          <div className="section-header">
            <h2>Your Quizzes</h2>
            <Link to="/quiz/create" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Create New Quiz
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h3>No quizzes yet</h3>
              <p>Create your first quiz to get started!</p>
              <Link to="/quiz/create" className="btn btn-primary btn-large">
                <i className="fas fa-plus"></i>
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="quizzes-grid">
              {quizzes.slice(0, 6).map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onDelete={handleDeleteQuiz}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;