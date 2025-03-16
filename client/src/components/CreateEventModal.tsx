import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createEvent, CreateEventData } from '../firebase/eventService';
import { getCoordinates } from '../utils/geocoding';
import LocationAutocomplete from './LocationAutocomplete';
import '../styles/CreateEventModal.css';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onEventCreated: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, userId, onEventCreated }) => {
  const { user, userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!user || !userProfile) {
      setError('You must be logged in to create an event');
      setIsLoading(false);
      return;
    }

    try {
      const eventDateTime = new Date(`${date}T${time}`);
      const coordinates = await getCoordinates(location);
      
      const eventData: CreateEventData = {
        title,
        description,
        location,
        coordinates,
        hostId: user.uid,
        hostName: userProfile.displayName,
        interests: userProfile.interests,
        date: eventDateTime,
        time: time
      };

      await createEvent(eventData);
      setSuccess('Event created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setDate('');
      setTime('');
      // Close modal after 2 seconds
      setTimeout(onClose, 2000);
    } catch (error: any) {
      console.error('Error creating event:', error);
      setError(error.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              placeholder="Enter event location"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal; 