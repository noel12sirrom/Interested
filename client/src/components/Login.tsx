import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onLogin(formData.email, formData.password);
      navigate('/profile');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`Logging in with ${provider}`);
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
          <h2>Sign in to your account</h2>
          <p className="subtitle">Welcome back! Please enter your details.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="remember-forgot">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="divider">
              <span>Or continue with</span>
            </div>

            <div className="social-login">
              <button
                type="button"
                className="social-button"
                onClick={() => handleSocialLogin('google')}
              >
                Google
              </button>
              <button
                type="button"
                className="social-button"
                onClick={() => handleSocialLogin('github')}
              >
                GitHub
              </button>
            </div>
          </form>

          <p className="signup-link">
            Don't have an account?{' '}
            <button 
              className="text-button"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 