import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile } from '../firebase/userService';
import '../styles/SignUp.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { checkUserProfile } = useAuth();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Create authentication user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await createUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: name,
        interests: [],
        location: '',
        bio: '',
        profilePicture: '',
        links: 0,
        events: 0
      });

      // Wait for the profile to be checked with the new user
      await checkUserProfile(user);
      
      // Add a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to profile page
      navigate('/profile');
    } catch (error: any) {
      console.error('Signup error:', error);
      // Handle specific error messages
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError('This email is already registered with a different method. Please log in with your original signup method.');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // User already exists, sign them out and show login message
        await auth.signOut();
        setError('This Google account is already registered. Please log in instead.');
        return;
      }

      // Create new user profile
      await createUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        interests: [],
        location: '',
        bio: '',
        profilePicture: user.photoURL || '',
        links: 0,
        events: 0
      });

      // Wait for the profile to be checked with the new user
      await checkUserProfile(user);
      
      // Add a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to profile page
      navigate('/profile');
    } catch (error: any) {
      console.error('Google signup error:', error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        setError('This email is already registered with a different method. Please log in with your original signup method.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign up was cancelled. Please try again.');
      } else {
        setError(error.message || 'Failed to sign up with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-image">
        <div className="signup-image-content">
          <h1>Join Our Community!</h1>
          <p>Connect with people who share your interests and passions. Create meaningful connections.</p>
        </div>
      </div>

      <div className="signup-form-container">
        <div className="signup-card">
          <img src="/logo.png" alt="Logo" className="brand-logo" />
          <h2>Create Account</h2>
          <p className="subtitle">Join us today! Please enter your details.</p>

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
                placeholder="Enter your full name"
                disabled={isLoading}
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
                placeholder="Enter your email"
                disabled={isLoading}
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
                placeholder="Create a password"
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="signup-button" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="divider">or</div>

          <button 
            onClick={handleGoogleSignUp} 
            className="google-button"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Sign up with Google'}
          </button>

          <p className="login-link">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')}>Log In</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;