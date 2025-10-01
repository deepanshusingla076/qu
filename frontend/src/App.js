import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import QuizAttempt from './pages/QuizAttempt';
import QuizCreate from './pages/QuizCreate';
import QuizAiGenerate from './pages/QuizAiGenerate';
import Profile from './pages/Profile';
import QuizResults from './pages/QuizResults';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
// Styles
import './App.css';

// Component to redirect to appropriate dashboard based on user role
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'TEACHER') {
    return <Navigate to="/teacher/dashboard" replace />;
  } else if (user?.role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />;
  }
  
  return <Navigate to="/" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/auth",
    element: (
      <PublicRoute>
        <AuthPage />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teacher/dashboard",
    element: (
      <ProtectedRoute requiredRole="TEACHER">
        <TeacherDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/dashboard",
    element: (
      <ProtectedRoute requiredRole="STUDENT">
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quiz/create",
    element: (
      <ProtectedRoute requiredRole="TEACHER">
        <QuizCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quiz/edit/:quizId",
    element: (
      <ProtectedRoute requiredRole="TEACHER">
        <QuizCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quiz/ai-generate",
    element: (
      <ProtectedRoute requiredRole="TEACHER">
        <QuizAiGenerate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quiz/:quizId/attempt",
    element: (
      <ProtectedRoute requiredRole="STUDENT">
        <QuizAttempt />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quiz/:quizId/results",
    element: (
      <ProtectedRoute>
        <QuizResults />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quiz/results/:resultId",
    element: (
      <ProtectedRoute>
        <QuizResults />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quiz/:quizId/results/:resultId",
    element: (
      <ProtectedRoute>
        <QuizResults />
      </ProtectedRoute>
    ),
  },
  {
    path: "/quiz/edit/:quizId",
    element: (
      <ProtectedRoute requiredRole="TEACHER">
        <QuizCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute requiredRole="TEACHER">
        <Analytics />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/404",
    element: <NotFound />,
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

function App() {
  return (
    <AuthProvider>
      <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                border: '3px solid #000',
                boxShadow: '4px 4px 0px #000',
                fontWeight: 'bold',
              },
              success: {
                style: {
                  background: '#00F5A0',
                  color: '#000',
                },
              },
              error: {
                style: {
                  background: '#FF5E5B',
                  color: '#fff',
                },
              },
            }}
          />
          
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
  );
}

export default App;