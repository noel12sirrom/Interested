import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, uploadProfilePicture } from '../firebase/userService';
import '../styles/Profile.css';
import { FaUser, FaMapMarkerAlt, FaHeart, FaEdit, FaSave, FaCamera, FaTimes, FaHome } from 'react-icons/fa';

interface Interest {
  id: string;
  name: string;
  selected: boolean;
}

const Profile: React.FC = () => {
  const { userProfile, checkUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    location: '',
    interests: [] as string[],
    bio: ''
  });
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [showInterestModal, setShowInterestModal] = useState(false);

  // Available interests
  const availableInterests = [
    'Technology', 'Sports', 'Music', 'Art', 'Travel', 'Food', 'Fitness',
    'Gaming', 'Movies', 'Books', 'Photography', 'Nature', 'Science',
    'Fashion', 'Business', 'Education', 'Health', 'Cooking', 'DIY',
    'Pets', 'Fitness', 'Yoga', 'Meditation', 'Dance', 'Theater'
  ];

  console.log('Profile component rendering, userProfile:', userProfile);

  useEffect(() => {
    console.log('Profile useEffect triggered, userProfile:', userProfile);
    if (userProfile) {
      console.log('Setting profile data from userProfile');
      setProfile({
        name: userProfile.displayName || '',
        location: userProfile.location || '',
        interests: userProfile.interests || [],
        bio: userProfile.bio || ''
      });
      
      // Set selected interests
      setSelectedInterests(
        availableInterests.map(interest => ({
          id: interest,
          name: interest,
          selected: userProfile.interests.includes(interest)
        }))
      );
    }
  }, [userProfile]);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.map(interest =>
        interest.id === interestId
          ? { ...interest, selected: !interest.selected }
          : interest
      )
    );
  };

  const handleUpdateProfile = async () => {
    if (!userProfile) return;

    setSubmitting(true);
    try {
      const updatedInterests = selectedInterests
        .filter(interest => interest.selected)
        .map(interest => interest.id);

      await updateUserProfile(userProfile.uid, {
        displayName: profile.name,
        location: profile.location,
        interests: updatedInterests,
        bio: profile.bio
      });

      await checkUserProfile(); // Refresh the profile data
      setIsEditing(false);
      setShowInterestModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !userProfile) return;

    const file = e.target.files[0];
    setUploadingPhoto(true);

    try {
      await uploadProfilePicture(userProfile.uid, file);
      await checkUserProfile(); // Refresh the profile to get the new photo URL
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!userProfile) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <button className="home-button" onClick={() => navigate('/home')}>
        <FaHome /> Home
      </button>
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-picture">
            {userProfile?.profilePicture ? (
              <img src={userProfile.profilePicture} alt="Profile" className="avatar-image" />
            ) : (
              <FaUser className="avatar-icon" />
            )}
            {isEditing && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button 
                  className="change-photo-button"
                  onClick={triggerFileInput}
                  disabled={uploadingPhoto}
                >
                  <FaCamera /> {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                </button>
              </>
            )}
          </div>
          <div className="profile-info">
            <div className="profile-header-info">
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="name-input"
                  placeholder="Your name"
                />
              ) : (
                <h1>{profile.name || 'Add your name'}</h1>
              )}
              <div className="header-actions">
                {isEditing ? (
                  <button
                    className="save-button"
                    onClick={handleUpdateProfile}
                    disabled={submitting}
                  >
                    <FaSave />
                  </button>
                ) : (
                  <button className="edit-button" onClick={() => setIsEditing(true)}>
                    <FaEdit />
                  </button>
                )}
              </div>
            </div>
            <div className="location-info">
              <FaMapMarkerAlt className="location-icon" />
              {isEditing ? (
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="Add your location"
                  className="location-input"
                />
              ) : (
                <span>{profile.location || 'Add your location'}</span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>About Me</h2>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="bio-input"
              />
            ) : (
              <p className="bio">{profile.bio || 'Add a bio to tell others about yourself'}</p>
            )}
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2>Interests</h2>
              {isEditing && (
                <button
                  className="edit-interests-button"
                  onClick={() => setShowInterestModal(true)}
                >
                  <FaEdit /> Edit Interests
                </button>
              )}
            </div>
            <div className="selected-interests">
              {profile.interests.length > 0 ? (
                profile.interests.map(interest => (
                  <span key={interest} className="interest-tag">
                    {interest}
                  </span>
                ))
              ) : (
                <p className="no-interests">No interests selected yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showInterestModal && (
        <div className="modal-overlay">
          <div className="interest-modal">
            <div className="modal-header">
              <h3>Select Your Interests</h3>
              <button
                className="close-button"
                onClick={() => setShowInterestModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="interests-grid">
              {selectedInterests.map(interest => (
                <button
                  key={interest.id}
                  className={`interest-button ${interest.selected ? 'selected' : ''}`}
                  onClick={() => handleInterestToggle(interest.id)}
                >
                  {interest.name}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowInterestModal(false)}
              >
                Cancel
              </button>
              <button
                className="save-button"
                onClick={() => {
                  setProfile(prev => ({
                    ...prev,
                    interests: selectedInterests
                      .filter(i => i.selected)
                      .map(i => i.id)
                  }));
                  setShowInterestModal(false);
                }}
              >
                Save Interests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 