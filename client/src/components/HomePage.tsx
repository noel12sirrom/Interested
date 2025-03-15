import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Connect Through Common Interests</h1>
          <p className="hero-subtitle">
            Find and connect with people who share your passions
          </p>
          <div className="cta-buttons">
            <button 
              className="primary-button"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </button>
            <button 
              className="secondary-button"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <section className="features-section">
        <h2>Why Join Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Match by Interests</h3>
            <p>Connect with people who share your specific interests and hobbies</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Meaningful Connections</h3>
            <p>Build genuine relationships based on common passions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>Discover Communities</h3>
            <p>Join interest-based groups and expand your network</p>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <h2>Popular Interest Categories</h2>
        <div className="categories-grid">
          {['Sports', 'Technology', 'Arts', 'Music', 'Gaming', 'Travel'].map(category => (
            <div key={category} className="category-card">
              <h4>{category}</h4>
              <button 
                className="explore-button"
                onClick={() => navigate('/signup')}
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="join-section">
        <div className="join-content">
          <h2>Ready to Connect?</h2>
          <p>Join our community and start meeting people who share your interests</p>
          <button 
            className="primary-button"
            onClick={() => navigate('/signup')}
          >
            Sign Up Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 