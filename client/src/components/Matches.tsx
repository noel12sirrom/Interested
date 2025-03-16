import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Matches.css';

interface Interest {
  id: number;
  name: string;
}

interface Match {
  id: number;
  name: string;
  bio: string;
  profilePicture?: string;
  matchPercentage: number;
  commonInterests: Interest[];
}

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get('/api/matches');
        setMatches(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load matches. Please try again later.');
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleConnect = async (matchId: number) => {
    try {
      await axios.post(`/api/matches/${matchId}/connect`);
      // You can add additional logic here, like showing a success message
      // or updating the UI to reflect the connection
    } catch (err) {
      console.error('Failed to connect with match:', err);
      // Handle error appropriately
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return <div className="loading">Loading matches...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="matches-container">
      <h2>Your Matches</h2>
      <div className="matches-grid">
        {matches.map(match => (
          <div key={match.id} className="match-card">
            <div className="match-header">
              {match.profilePicture ? (
                <img
                  src={match.profilePicture}
                  alt={match.name}
                  className="match-picture"
                />
              ) : (
                <div className="match-picture-placeholder">
                  {getInitials(match.name)}
                </div>
              )}
              <div className="match-percentage">
                {Math.round(match.matchPercentage)}% Match
              </div>
            </div>
            <div className="match-info">
              <h3>{match.name}</h3>
              <p className="match-bio">{match.bio}</p>
              <div className="common-interests">
                <h4>Common Interests</h4>
                <div className="interest-tags">
                  {match.commonInterests.map(interest => (
                    <span key={interest.id} className="interest-tag">
                      {interest.name}
                    </span>
                  ))}
                </div>
              </div>
              <button
                className="connect-button"
                onClick={() => handleConnect(match.id)}
              >
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches; 