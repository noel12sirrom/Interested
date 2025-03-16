import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile } from '../firebase/userService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/profile');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(error.message || 'Failed to log in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Please check your inbox.');
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError(error.message || 'Failed to send password reset email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    console.log('Starting Google login process...');
    
    try {
      const provider = new GoogleAuthProvider();
      // Add select_account to force account selection
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Initializing Google sign-in popup...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.email);
      
      const user = result.user;

      // Check if user exists in Firestore
      console.log('Checking if user exists in Firestore...');
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('User does not exist in Firestore, signing out...');
        // User doesn't exist, sign them out and show signup message
        await auth.signOut();
        setError('No account found with this Google account. Please sign up first.');
        return;
      }

      console.log('User exists in Firestore, navigating to profile...');
      navigate('/profile');
    } catch (error: any) {
      console.error('Google login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError('This email is already registered with a different method. Please log in with your original signup method.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Multiple popup requests were made. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error occurred. Please check your internet connection and try again.');
      } else {
        setError(error.message || 'Failed to log in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <div className="login-image-content">
          <h1>Welcome Back!</h1>
          <p>Sign in to continue connecting with people who share your interests.</p>
        </div>
      </div>

      <div className="login-form-container">
        <div className="login-card">
          <h2>Sign In</h2>
          <p className="subtitle">Welcome back! Please enter your details.</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!showForgotPassword ? (
            <form onSubmit={handleEmailLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">
                  Password
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label htmlFor="reset-email">Email</label>
                <input
                  type="email"
                  id="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                className="back-to-login"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </button>
            </form>
          )}

          <div className="divider"><span>or</span></div>

          <button 
            onClick={handleGoogleLogin} 
            className="google-button"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Sign in with Google'}
          </button>

          <p className="signup-link">
            Don't have an account?{' '}
            <span onClick={() => navigate('/')}>Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;