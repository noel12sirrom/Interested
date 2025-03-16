import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MatchedUser, findUsersByInterests } from '../firebase/userService';
import { FaUser } from 'react-icons/fa';
import '../styles/UserMatches.css';

const UserMatches: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const matchedUsers = await findUsersByInterests(user.uid);
        setMatches(matchedUsers);
      } catch (err) {
        console.error('Error loading matches:', err);
        setError('Failed to load matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [user]);

  if (loading) {
    return <div className="matches-loading">Loading matches...</div>;
  }

  if (error) {
    return <div className="matches-error">{error}</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="no-matches">
        <p>No matches found. Try updating your interests to find more people!</p>
      </div>
    );
  }

  return (
    <div className="matches-container">
      <h2>People with Similar Interests</h2>
      <div className="matches-grid">
        {matches.map((match) => (
          <div key={match.uid} className="match-card">
            <div className="match-header">
              <div className="match-avatar">
                {match.profilePicture ? (
                  <img src={match.profilePicture} alt={match.name} />
                ) : (
                  <FaUser className="avatar-placeholder" />
                )}
              </div>
              <div className="match-info">
                <h3>{match.name}</h3>
                <p className="match-location">{match.location}</p>
              </div>
              <div className="match-score">
                <span className="score-number">{match.matchScore}</span>
                <span className="score-label">Match</span>
              </div>
            </div>
            
            <div className="common-interests">
              <h4>Common Interests</h4>
              <div className="interests-tags">
                {match.commonInterests.map((interest) => (
                  <span key={interest} className="interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <button className="connect-button">
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserMatches; 