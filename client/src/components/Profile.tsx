import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaBell, FaComments, FaPlus } from 'react-icons/fa';
import '../styles/Profile.css';

interface Interest {
  id: string;
  name: string;
  category: string;
}

interface UserProfile {
  name: string;
  location: string;
  interests: string[];
  bio?: string;
  profilePicture?: string;
  links?: number;
  events?: number;
}

// Predefined interests for each category
const predefinedInterests: Interest[] = [
  // Sports
  { id: 'football', name: 'Football', category: 'Sports' },
  { id: 'basketball', name: 'Basketball', category: 'Sports' },
  { id: 'cricket', name: 'Cricket', category: 'Sports' },
  { id: 'tennis', name: 'Tennis', category: 'Sports' },
  { id: 'swimming', name: 'Swimming', category: 'Sports' },
  { id: 'volleyball', name: 'Volleyball', category: 'Sports' },
  
  // Technology
  { id: 'programming', name: 'Programming', category: 'Technology' },
  { id: 'ai', name: 'Artificial Intelligence', category: 'Technology' },
  { id: 'blockchain', name: 'Blockchain', category: 'Technology' },
  { id: 'cybersecurity', name: 'Cybersecurity', category: 'Technology' },
  { id: 'web-dev', name: 'Web Development', category: 'Technology' },
  { id: 'mobile-dev', name: 'Mobile Development', category: 'Technology' },
  
  // Arts
  { id: 'painting', name: 'Painting', category: 'Arts' },
  { id: 'drawing', name: 'Drawing', category: 'Arts' },
  { id: 'photography', name: 'Photography', category: 'Arts' },
  { id: 'sculpture', name: 'Sculpture', category: 'Arts' },
  { id: 'digital-art', name: 'Digital Art', category: 'Arts' },
  
  // Music
  { id: 'rock', name: 'Rock', category: 'Music' },
  { id: 'jazz', name: 'Jazz', category: 'Music' },
  { id: 'classical', name: 'Classical', category: 'Music' },
  { id: 'pop', name: 'Pop', category: 'Music' },
  { id: 'reggae', name: 'Reggae', category: 'Music' },
  { id: 'dancehall', name: 'Dancehall', category: 'Music' },
  
  // Gaming
  { id: 'pc-gaming', name: 'PC Gaming', category: 'Gaming' },
  { id: 'console-gaming', name: 'Console Gaming', category: 'Gaming' },
  { id: 'mobile-gaming', name: 'Mobile Gaming', category: 'Gaming' },
  { id: 'board-games', name: 'Board Games', category: 'Gaming' },
  { id: 'card-games', name: 'Card Games', category: 'Gaming' },
  
  // Reading
  { id: 'fiction', name: 'Fiction', category: 'Reading' },
  { id: 'non-fiction', name: 'Non-Fiction', category: 'Reading' },
  { id: 'poetry', name: 'Poetry', category: 'Reading' },
  { id: 'comics', name: 'Comics', category: 'Reading' },
  { id: 'manga', name: 'Manga', category: 'Reading' },
  
  // Travel
  { id: 'beach', name: 'Beach', category: 'Travel' },
  { id: 'mountains', name: 'Mountains', category: 'Travel' },
  { id: 'city-trips', name: 'City Trips', category: 'Travel' },
  { id: 'backpacking', name: 'Backpacking', category: 'Travel' },
  { id: 'road-trips', name: 'Road Trips', category: 'Travel' },
  
  // Food
  { id: 'cooking', name: 'Cooking', category: 'Food' },
  { id: 'baking', name: 'Baking', category: 'Food' },
  { id: 'restaurants', name: 'Restaurants', category: 'Food' },
  { id: 'wine-tasting', name: 'Wine Tasting', category: 'Food' },
  { id: 'vegan', name: 'Vegan', category: 'Food' },
  
  // Movies
  { id: 'action', name: 'Action', category: 'Movies' },
  { id: 'comedy', name: 'Comedy', category: 'Movies' },
  { id: 'drama', name: 'Drama', category: 'Movies' },
  { id: 'horror', name: 'Horror', category: 'Movies' },
  { id: 'documentaries', name: 'Documentaries', category: 'Movies' },
  
  // Science
  { id: 'physics', name: 'Physics', category: 'Science' },
  { id: 'biology', name: 'Biology', category: 'Science' },
  { id: 'chemistry', name: 'Chemistry', category: 'Science' },
  { id: 'astronomy', name: 'Astronomy', category: 'Science' },
  { id: 'psychology', name: 'Psychology', category: 'Science' }
];

const Profile = () => {
  const { user, checkUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    location: '',
    interests: [],
    bio: '',
    links: 0,
    events: 0
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setProfile(userData);
          setSelectedInterests(userData.interests || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user]);

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
    if (!isEditing) return;
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      if (!profile.name || !profile.location || selectedInterests.length === 0) {
        alert('Please fill in your name, location, and select at least one interest');
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...profile,
        interests: selectedInterests,
      }, { merge: true });

      await checkUserProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInterestName = (id: string) => {
    const interest = predefinedInterests.find(i => i.id === id);
    return interest ? interest.name : id;
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <FaBell className="icon" />
          <FaComments className="icon" />
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-avatar">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" />
          ) : (
            <FaUser className="avatar-placeholder" />
          )}
        </div>

        {isEditing ? (
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your Name"
            className="name-input"
          />
        ) : (
          <h1 className="profile-name">{profile.name || 'Add Your Name'}</h1>
        )}

        <div className="profile-stats">
          <div className="stat">
            <span className="stat-number">{profile.links || 0}</span>
            <span className="stat-label">Links</span>
          </div>
          <div className="stat">
            <span className="stat-number">{profile.events || 0}</span>
            <span className="stat-label">Events</span>
          </div>
          <button className="add-button">
            <FaPlus />
          </button>
        </div>

        <div className="profile-section">
          <h3>Interests</h3>
          <div className="interests-list">
            {selectedInterests.map(interestId => (
              <span key={interestId} className="interest-tag">
                {getInterestName(interestId)}
              </span>
            ))}
          </div>
        </div>

        {isEditing && (
          <>
            <div className="profile-section">
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Your Location"
                className="text-input"
              />
              
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="bio-input"
              />
            </div>

            <div className="profile-section">
              <h3>Select Your Interests</h3>
              <div className="interests-grid">
                {categories.map(category => (
                  <div key={category} className="category-section">
                    <h4>{category}</h4>
                    <div className="interest-tags">
                      {predefinedInterests
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
          </>
        )}

        <button 
          className="edit-button" 
          onClick={isEditing ? handleUpdateProfile : () => setIsEditing(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Profile' : 'Edit Profile'}
        </button>
      </div>
    </div>
  );
};

export default Profile; 