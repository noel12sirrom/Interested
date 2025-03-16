import React from 'react';
import { Event } from '../firebase/eventService';
import { useAuth } from '../contexts/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/EventCard.css';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user?.uid === event.userId;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <h3>{event.title}</h3>
        {isOwner && (
          <div className="event-actions">
            <button 
              className="icon-button edit"
              onClick={() => onEdit(event)}
              title="Edit event"
            >
              <FaEdit />
            </button>
            <button 
              className="icon-button delete"
              onClick={() => onDelete(event.id)}
              title="Delete event"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
      <p className="event-description">{event.description}</p>
      <div className="event-details">
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Date:</strong> {formatDate(event.date)}</p>
        <p><strong>Time:</strong> {event.time}</p>
      </div>
    </div>
  );
};

export default EventCard; 