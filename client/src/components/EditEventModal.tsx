import { useState, useEffect } from 'react';
import { Event, updateEvent } from '../firebase/eventService';
import LocationSearchMap from './LocationSearchMap';
import '../styles/Modal.css';
import { FaTimes } from 'react-icons/fa';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  userId: string;
  onEventUpdated: () => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  event,
  userId,
  onEventUpdated,
}: EditEventModalProps) => {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location);
  const [locationCoordinates, setLocationCoordinates] = useState(event.locationCoordinates);
  const [date, setDate] = useState(event.date.toISOString().split('T')[0]);
  const [time, setTime] = useState(event.time);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTitle(event.title);
    setDescription(event.description);
    setLocation(event.location);
    setLocationCoordinates(event.locationCoordinates);
    setDate(event.date.toISOString().split('T')[0]);
    setTime(event.time);
    setError('');
    setSuccess('');
  }, [event]);

  const handleLocationSelect = (selectedLocation: string, coordinates: { lat: number; lng: number }) => {
    setLocation(selectedLocation);
    setLocationCoordinates(coordinates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!locationCoordinates) {
      setError('Please select a location on the map');
      setIsLoading(false);
      return;
    }

    try {
      const eventDateTime = new Date(`${date}T${time}`);
      
      const eventData = {
        title,
        description,
        location,
        locationCoordinates,
        date: eventDateTime,
        time: time
      };

      await updateEvent(event.id, userId, eventData);
      setSuccess('Event updated successfully!');
      setTimeout(() => {
        onEventUpdated();
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error updating event:', error);
      setError(error.message || 'Failed to update event');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Edit Event</h2>
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
            <label>Location</label>
            <LocationSearchMap
              onLocationSelect={handleLocationSelect}
              initialLocation={locationCoordinates}
              initialAddress={location}
            />
            <input
              type="text"
              id="location"
              value={location}
              readOnly
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
              {isLoading ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal; 