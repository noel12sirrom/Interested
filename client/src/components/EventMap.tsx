import React from 'react';
import { Event } from '../firebase/eventService';
import '../styles/EventMap.css';

interface EventMapProps {
  events: Event[];
  onMarkerClick?: (eventId: string) => void;
}

const EventMap: React.FC<EventMapProps> = ({ events, onMarkerClick }) => {
  return (
    <div className="event-locations">
      <h3>Event Locations</h3>
      <div className="location-list">
        {events.map((event) => (
          <div
            key={event.id}
            className="location-item"
            onClick={() => onMarkerClick?.(event.id)}
          >
            <span className="location-name">{event.location}</span>
            <span className="event-title">{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventMap; 