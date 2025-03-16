import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createEvent } from '../firebase/eventService';
import '../styles/CreateEventModal.css';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
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
      // Combine date and time into a single Date object
      const eventDateTime = new Date(`${date}T${time}`);
      
      const eventData = {
        title,
        description,
        location,
        hostId: user.uid,
        hostName: userProfile.displayName,
        interests: userProfile.interests,
        date: eventDateTime,
        time: time // Store time separately for display purposes
      };

      await createEvent(eventData);
      setSuccess('Event created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setDate('');
      setTime('');
      setInterests([]);
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
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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