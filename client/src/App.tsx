import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import SignUp from './components/SignUp';
import HomePage from './components/HomePage';
import Profile from './components/Profile';
import Matches from './components/Matches';
import './index.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireProfile = true }) => {
  const { user, loading, hasProfile } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute rendering:', { user: user?.uid, loading, hasProfile, path: location.pathname });

  if (loading) {
    console.log('ProtectedRoute: Still loading');
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to /');
    return <Navigate to="/" />;
  }

  // If we're already on the profile page, don't redirect
  if (requireProfile && !hasProfile && location.pathname !== '/profile') {
    console.log('ProtectedRoute: No profile, redirecting to /profile');
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requireProfile={false}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 