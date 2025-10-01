import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';
import resultService from '../services/resultService';
import DashboardLayout from '../components/DashboardLayout';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    quizzesCompleted: 0,
    bestScore: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch available quizzes
      let quizzes = [];
      try {
        const quizzesResponse = await quizService.getAllQuizzes();
        
        // Handle various response formats
        if (Array.isArray(quizzesResponse)) {
          quizzes = quizzesResponse;
        } else if (quizzesResponse && Array.isArray(quizzesResponse.content)) {
          quizzes = quizzesResponse.content;
        } else if (quizzesResponse && quizzesResponse.data && Array.isArray(quizzesResponse.data)) {
          quizzes = quizzesResponse.data;
        } else {
          quizzes = [];
        }
        
        // Ensure each quiz has required fields
        quizzes = quizzes.map(quiz => ({
          ...quiz,
          totalQuestions: quiz.totalQuestions || quiz.questionCount || 0,
          isActive: quiz.isActive !== undefined ? quiz.isActive : (quiz.active !== undefined ? quiz.active : true),
          timeLimit: quiz.timeLimit || 30,
          difficulty: quiz.difficulty || 'MEDIUM'
        }));
        
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast.error(`Failed to load quizzes: ${error.message}`);
        quizzes = [];
      }
      
      // Fetch user's results
      let userResults = [];
      try {
        const resultsResponse = await resultService.getResultsByUser(user.id);
        
        // Handle various response formats
        if (Array.isArray(resultsResponse)) {
          userResults = resultsResponse;
        } else if (resultsResponse && Array.isArray(resultsResponse.content)) {
          userResults = resultsResponse.content;
        } else if (resultsResponse && resultsResponse.data && Array.isArray(resultsResponse.data)) {
          userResults = resultsResponse.data;
        } else {
          userResults = [];
        }
        
        // Ensure each result has required fields
        userResults = userResults.map(result => ({
          ...result,
          score: result.score || result.percentage || 0,
          timeTaken: result.timeTaken || result.duration || 0,
          completedAt: result.completedAt || result.submittedAt || new Date().toISOString()
        }));
        
      } catch (error) {
        console.error('Error fetching results:', error);
        // Don't show error toast for results as it's not critical for dashboard display
        console.warn('Quiz results could not be loaded, continuing without them');
        userResults = [];
      }
      
      setRecentResults(userResults.slice(0, 5)); // Show recent 5 results

      // Create a map of attempted quizzes for easy lookup
      const attemptedQuizMap = {};
      userResults.forEach(result => {
        if (!attemptedQuizMap[result.quizId] || attemptedQuizMap[result.quizId].score < result.score) {
          attemptedQuizMap[result.quizId] = result; // Keep the best attempt
        }
      });

      // Add attempt information to available quizzes and ensure active status
      console.log('All quizzes before filtering:', quizzes);
      
      const quizzesWithAttempts = quizzes
        .filter(quiz => {
          // Check multiple possible field names for active status
          const isActive = quiz.active || quiz.isActive || quiz.status === 'ACTIVE';
          console.log(`Quiz ${quiz.title}: active=${quiz.active}, isActive=${quiz.isActive}, status=${quiz.status}, filtered result=${isActive}`);
          return isActive;
        })
        .map(quiz => ({
          ...quiz,
          hasAttempted: !!attemptedQuizMap[quiz.id],
          attemptedResult: attemptedQuizMap[quiz.id] || null
        }));

      console.log('Active quizzes after filtering:', quizzesWithAttempts);
      setAvailableQuizzes(quizzesWithAttempts);

      // Calculate stats
      const totalAttempts = userResults.length;
      const scores = userResults.map(result => result.score);
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      
      // Count unique quizzes completed
      const uniqueQuizzes = new Set(userResults.map(result => result.quizId));
      const quizzesCompleted = uniqueQuizzes.size;

      setStats({
        totalAttempts,
        averageScore,
        quizzesCompleted,
        bestScore
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
        className="student-dashboard"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="dashboard-header" variants={itemVariants}>
          <h1>Welcome back, <span className="accent">{user.firstName}</span>!</h1>
          <p>Discover quizzes, track your progress, and improve your knowledge</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div className="stats-grid" variants={itemVariants}>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.bestScore}%</div>
              <div className="stat-label">Best Score</div>
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

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.quizzesCompleted}</div>
              <div className="stat-label">Quizzes Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-play"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalAttempts}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions removed for a cleaner, compact dashboard */}

        <div className="dashboard-content">
          {/* Recent Quiz Results */}
          <motion.div className="recent-results" variants={itemVariants}>
            <div className="section-header">
              <h2>Recent Results</h2>
            </div>

            {recentResults.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <h3>No quiz attempts yet</h3>
                <p>Take your first quiz to see your results here!</p>
              </div>
            ) : (
              <div className="results-list">
                {recentResults.map((result) => (
                  <motion.div
                    key={result.id}
                    className="result-item"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="result-info">
                      <h3>{result.quizTitle}</h3>
                      <div className="result-meta">
                        <span className="date">
                          <i className="fas fa-calendar"></i>
                          {formatDate(result.completedAt)}
                        </span>
                        <span className="time">
                          <i className="fas fa-clock"></i>
                          {Math.round(result.timeTaken / 60)} min
                        </span>
                      </div>
                    </div>
                    <div className={`score-badge ${getScoreColor(result.score)}`}>
                      {result.score}%
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Available Quizzes */}
          <motion.div className="available-quizzes" variants={itemVariants}>
            <div className="section-header">
              <h2>Available Quizzes</h2>
            </div>

            {availableQuizzes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3>No quizzes available</h3>
                <p>Check back later for new quizzes!</p>
              </div>
            ) : (
              <div className="quizzes-grid">
                {availableQuizzes.slice(0, 6).map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    showActions={false}
                    showTakeQuiz={true}
                    hasAttempted={quiz.hasAttempted}
                    attemptedResult={quiz.attemptedResult}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default StudentDashboard;