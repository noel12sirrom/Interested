import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEvents, getEventsByInterests, Event } from '../firebase/eventService';
import CreateEventModal from './CreateEventModal';
import '../styles/HomePage.css';
import { FaSearch, FaPlus, FaUser, FaMapMarkerAlt, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

type EventFilter = 'all' | 'my' | 'interests';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<EventFilter>('all');
  const { userProfile, user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        let fetchedEvents: Event[] = [];
        
        if (activeFilter === 'interests' && userProfile?.interests?.length) {
          fetchedEvents = await getEventsByInterests(userProfile.interests, user?.uid);
        } else {
          fetchedEvents = await getEvents(searchQuery, user?.uid, activeFilter);
        }

        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, userProfile?.interests, activeFilter, user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="homepage">
      <button className="profile-button" onClick={() => navigate('/profile')}>
        <FaUserCircle /> Profile
      </button>
      <button className="sign-out-button" onClick={handleSignOut}>
        <FaSignOutAlt /> Sign Out
      </button>
      <div className="homepage-content">
        <header className="header">
          <h1 className="logo">LinkUp</h1>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by location"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <button className="create-button" onClick={() => setIsModalOpen(true)}>
            <FaPlus />
          </button>
        </header>

        <main className="main-content">
          <aside className="filters">
            <h2>Filter Events</h2>
            <div className="filter-options">
              <button 
                className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Events
              </button>
              <button 
                className={`filter-button ${activeFilter === 'my' ? 'active' : ''}`}
                onClick={() => setActiveFilter('my')}
              >
                My Events
              </button>
              <button 
                className={`filter-button ${activeFilter === 'interests' ? 'active' : ''}`}
                onClick={() => setActiveFilter('interests')}
              >
                Events by Interests
              </button>
            </div>
          </aside>

          <section className="events-list">
            {isLoading ? (
              <div className="loading">Loading events...</div>
            ) : events.length > 0 ? (
              events.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <div className="event-host">
                      <div className="host-avatar">
                        <FaUser />
                      </div>
                      <div className="host-info">
                        <p className="host-name">{event.hostName}</p>
                      </div>
                    </div>
                    <div className="event-location">
                      <FaMapMarkerAlt className="location-icon" />
                      {event.location}
                    </div>
                  </div>
                  
                  <div className="event-content">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    <div className="event-meta">
                      <div className="event-date">
                        <span className="date-label">Date:</span>
                        {formatDate(event.date)}
                      </div>
                      <div className="event-time">
                        <span className="time-label">Time:</span>
                        {event.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events">
                {searchQuery ? 'No events found in this location' : 'No events available'}
              </div>
            )}
          </section>
        </main>
      </div>

      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default HomePage; 