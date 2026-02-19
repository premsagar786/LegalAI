import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Analyze from './pages/Analyze';
import Lawyers from './pages/Lawyers';
import LawyerProfile from './pages/LawyerProfile';
import Dashboard from './pages/Dashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import About from './pages/About';


// Import global styles
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout wrapper
const Layout = ({ children, showFooter = true }) => (
  <>
    <Navbar />
    <main>{children}</main>
    {showFooter && <Footer />}
  </>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/analyze"
        element={
          <Layout>
            <Analyze />
          </Layout>
        }
      />

      <Route
        path="/lawyers"
        element={
          <Layout>
            <Lawyers />
          </Layout>
        }
      />

      <Route
        path="/lawyers/:id"
        element={
          <Layout>
            <LawyerProfile />
          </Layout>
        }
      />

      <Route
        path="/about"
        element={
          <Layout>
            <About />
          </Layout>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout showFooter={false}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lawyer-dashboard"
        element={
          <ProtectedRoute allowedRoles={['lawyer']}>
            <Layout showFooter={false}>
              <LawyerDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)'
                },
                success: {
                  iconTheme: {
                    primary: 'var(--success)',
                    secondary: 'white'
                  }
                },
                error: {
                  iconTheme: {
                    primary: 'var(--danger)',
                    secondary: 'white'
                  }
                }
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
