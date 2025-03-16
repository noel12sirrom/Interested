import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEvents, getEventsByInterests, Event, deleteEvent } from '../firebase/eventService';
import CreateEventModal from './CreateEventModal';
import EditEventModal from './EditEventModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import '../styles/HomePage.css';
import { FaSearch, FaPlus, FaUser, FaMapMarkerAlt, FaUserCircle, FaSignOutAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { auth, db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { createEvent, updateEvent } from '../firebase/eventService';

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

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
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, [searchQuery, userProfile?.interests, activeFilter, user]);

  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        initializeAutocomplete();
      }
    };

    const handleMapsLoaded = () => {
      checkGoogleMapsLoaded();
    };

    // Check if already loaded
    checkGoogleMapsLoaded();

    // Listen for the load event
    window.addEventListener('googleMapsLoaded', handleMapsLoaded);

    return () => {
      window.removeEventListener('googleMapsLoaded', handleMapsLoaded);
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!searchInputRef.current || searchBox) return;

    try {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['geocode'],
        fields: ['formatted_address', 'geometry']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setSearchQuery(place.formatted_address);
          fetchEvents();
        }
      });

      setSearchBox(autocomplete);
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  };

  // Remove the old useEffect for searchBox initialization
  useEffect(() => {
    if (isGoogleMapsLoaded && searchInputRef.current && !searchBox) {
      initializeAutocomplete();
    }
  }, [isGoogleMapsLoaded, searchInputRef.current]);

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

  const handleCreateEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      await createEvent(eventData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleEditEventSubmit = async (eventId: string, eventData: Partial<Event>) => {
    try {
      if (!user) return;
      await updateEvent(eventId, user.uid, eventData);
      setIsEditModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleMarkerClick = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const element = document.getElementById(`event-${eventId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
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
              ref={searchInputRef}
            />
          </div>
          <button className="create-button" onClick={() => setIsCreateModalOpen(true)}>
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
                <div key={event.id} id={`event-${event.id}`} className="event-card">
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
                        <span className="date-label">Date:</span>
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