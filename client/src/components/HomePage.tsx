import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEvents, getEventsByInterests, Event, deleteEvent } from '../firebase/eventService';
import CreateEventModal from './CreateEventModal';
import EditEventModal from './EditEventModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import '../styles/HomePage.css';
import { FaSearch, FaPlus, FaUser, FaMapMarkerAlt, FaUserCircle, FaSignOutAlt, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { auth, db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

type EventFilter = 'all' | 'my' | 'interests';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeFilter, setActiveFilter] = useState<EventFilter>('all');
  const { userProfile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching events with filter:', activeFilter);
      console.log('User ID:', user?.uid);
      console.log('Search query:', searchQuery);
      
      let fetchedEvents: Event[] = [];
      
      if (activeFilter === 'interests' && userProfile?.interests?.length) {
        console.log('Fetching events by interests:', userProfile.interests);
        fetchedEvents = await getEventsByInterests(userProfile.interests, user?.uid);
      } else {
        console.log('Fetching all events');
        fetchedEvents = await getEvents(searchQuery, user?.uid, activeFilter);
      }

      console.log('Fetched events:', fetchedEvents);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Subscribe to events
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        date: doc.data().date?.toDate(),
      })) as Event[];

      // Apply filters based on activeFilter
      let filteredEvents = eventsData;
      
      if (activeFilter === 'my' && user?.uid) {
        filteredEvents = eventsData.filter(event => event.hostId === user.uid);
      } else if (activeFilter === 'interests' && userProfile?.interests?.length) {
        filteredEvents = eventsData.filter(event => 
          event.interests.some(eventInterest => 
            userProfile.interests.some(userInterest => 
              eventInterest.toLowerCase() === userInterest.toLowerCase()
            )
          ) && event.hostId !== user?.uid
        );
      }

      // Apply location search filter if exists
      if (searchQuery) {
        const searchTerm = searchQuery.toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.location.toLowerCase().includes(searchTerm)
        );
      }

      setEvents(filteredEvents);
    });

    return () => unsubscribe();
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

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete || !user) return;
    
    try {
      await deleteEvent(eventToDelete.id, user.uid);
      setEvents(events.filter(event => event.id !== eventToDelete.id));
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleEventUpdated = () => {
    fetchEvents();
  };

  return (
    <div className="homepage">
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="profile-button" onClick={() => navigate('/profile')}>
              <FaUserCircle /> Profile
            </button>
            <button className="sign-out-button" onClick={handleSignOut}>
              <FaSignOutAlt /> Sign Out
            </button>
            <button className="create-button" onClick={() => setIsCreateModalOpen(true)}>
              <FaPlus />
            </button>
          </div>
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

          <section className="events-section">
            {isLoading ? (
              <div className="loading">Loading events...</div>
            ) : events.length > 0 ? (
              events.map(event => (
                <div key={event.id} id={`event-${event.id}`} className="event-card">
                  <div className="event-header">
                    <div className="event-host">
                      <div className="host-avatar">
                        <FaUser />
                      </div>
                      <div className="host-info">
                        <p className="host-name">{event.hostName}</p>
                        <div className="event-location">
                          <FaMapMarkerAlt className="location-icon" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                    {user && event.hostId === user.uid && (
                      <div className="event-actions">
                        <button
                          className="edit-button"
                          onClick={() => handleEditEvent(event)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteClick(event)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="event-content">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    <div className="event-meta">
                      <div className="event-date">
                        <FaCalendarAlt />
                        {formatDate(event.date)}
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

      {isCreateModalOpen && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          userId={user?.uid || ''}
          onEventCreated={handleEventUpdated}
        />
      )}

      {isEditModalOpen && selectedEvent && (
        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          userId={user?.uid || ''}
          onEventUpdated={handleEventUpdated}
        />
      )}

      {isDeleteModalOpen && eventToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setEventToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          eventTitle={eventToDelete.title}
        />
      )}
    </div>
  );
};

export default HomePage; 