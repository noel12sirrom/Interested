import { useState, useEffect } from 'react';
import '../styles/Matches.css';

interface MatchUser {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  commonInterests: string[];
  matchPercentage: number;
}

const Matches = () => {
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement API call to fetch matches
    const fetchMatches = async () => {
      try {
        // Simulated API response
        const response = await Promise.resolve([
          {
            id: '1',
            name: 'John Doe',
            bio: 'Love technology and gaming!',
            commonInterests: ['Gaming', 'Technology', 'Science'],
            matchPercentage: 85
          },
          // Add more mock data as needed
        ]);
        setMatches(response);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleConnect = async (userId: string) => {
    try {
      // TODO: Implement connection request
      console.log('Sending connection request to:', userId);
    } catch (error) {
      console.error('Failed to send connection request:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading potential matches...</div>;
  }

  return (
    <div className="matches-container">
      <h2>People with Similar Interests</h2>
      <div className="matches-grid">
        {matches.map(match => (
          <div key={match.id} className="match-card">
            <div className="match-header">
              {match.profilePicture ? (
                <img src={match.profilePicture} alt={match.name} className="match-picture" />
              ) : (
                <div className="match-picture-placeholder">{match.name[0]}</div>
              )}
              <div className="match-percentage">{match.matchPercentage}% Match</div>
            </div>
            
            <div className="match-info">
              <h3>{match.name}</h3>
              {match.bio && <p className="match-bio">{match.bio}</p>}
              
              <div className="common-interests">
                <h4>Common Interests:</h4>
                <div className="interest-tags">
                  {match.commonInterests.map(interest => (
                    <span key={interest} className="interest-tag">
                      {interest}
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