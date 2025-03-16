import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail, signInWithGoogle } from '../firebase/authService';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <div className="login-image-content">
          <h1>Welcome Back!</h1>
          <p>Connect with people who share your interests and passions. Join our community of like-minded individuals.</p>
        </div>
      </div>

      <div className="login-form-container">
        <div className="login-card">
          <img src="/logo.png" alt="Logo" className="brand-logo" />
          <h2>Welcome Back</h2>
          <p className="subtitle">Welcome back! Please enter your details.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Log In
            </button>
          </form>

          <div className="divider">or</div>

          <button onClick={handleGoogleLogin} className="google-button">
            Continue with Google
          </button>

          <p className="signup-link">
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')}>Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 