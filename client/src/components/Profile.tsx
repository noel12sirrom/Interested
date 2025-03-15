import { useState, useEffect } from 'react';
import '../styles/Profile.css';

interface Interest {
  id: string;
  name: string;
  category: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  interests: string[];
  bio?: string;
  profilePicture?: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  const categories = [
    'Sports',
    'Technology',
    'Arts',
    'Music',
    'Gaming',
    'Reading',
    'Travel',
    'Food',
    'Movies',
    'Science'
  ];

  const handleInterestSelect = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleUpdateProfile = async () => {
    try {
      // TODO: Implement API call to update profile
      console.log('Updating profile with:', { interests: selectedInterests, bio });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Your Profile</h2>
        {user?.profilePicture && (
          <img src={user.profilePicture} alt="Profile" className="profile-picture" />
        )}
      </div>

      <div className="profile-section">
        <h3>About You</h3>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          className="bio-input"
        />
      </div>

      <div className="profile-section">
        <h3>Your Interests</h3>
        <div className="interests-grid">
          {categories.map(category => (
            <div key={category} className="category-section">
              <h4>{category}</h4>
              <div className="interest-tags">
                {interests
                  .filter(interest => interest.category === category)
                  .map(interest => (
                    <button
                      key={interest.id}
                      className={`interest-tag ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
                      onClick={() => handleInterestSelect(interest.id)}
                    >
                      {interest.name}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="update-button" onClick={handleUpdateProfile}>
        Update Profile
      </button>
    </div>
  );
};

export default Profile; 