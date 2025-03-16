import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail, signInWithGoogle } from '../firebase/authService';
import { createUserProfile } from '../firebase/userService';
import '../styles/SignUp.css';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await signUpWithEmail(email, password);
      if (user) {
        await createUserProfile({
          uid: user.uid,
          email: user.email || email,
          displayName: name,
          interests: [],
        });
      }
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        await createUserProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          interests: [],
        });
      }
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleEmailSignUp}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              minLength={6}
            />
          </div>
          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>
        <div className="divider">or</div>
        <button onClick={handleGoogleSignUp} className="google-button">
          Continue with Google
        </button>
        <p className="login-link">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Log In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;