import * as React from 'react';
import { useState } from 'react';
import '../styles/HomePage.css';
import { FaSearch, FaPlus, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

interface Event {
  id: string;
  title: string;
  location: string;
  host: string;
  commonInterests: number;
}

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [corsTest, setCorsTest] = useState<string>('');
  
  const testCors = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/test-cors');
      setCorsTest(response.data.message);
    } catch (error) {
      console.error('CORS Test Error:', error);
      setCorsTest('CORS test failed');
    }
  };

  // Mock data - replace with actual data from Firebase
  const events: Event[] = [
    {
      id: '1',
      title: 'Some Event',
      location: 'Address 1, City, Parish',
      host: 'User123',
      commonInterests: 6
    },
    {
      id: '2',
      title: 'Some Event',
      location: 'Address 1, City, Parish',
      host: 'User123',
      commonInterests: 6
    },
    {
      id: '3',
      title: 'Some Event',
      location: 'Address 1, City, Parish',
      host: 'User123',
      commonInterests: 6
    },
    {
      id: '4',
      title: 'Some Event',
      location: 'Address 1, City, Parish',
      host: 'User123',
      commonInterests: 6
    }
  ];

  return (
    <div className="homepage">
      <div className="homepage-content">
        <header className="header">
          <h1 className="logo">LinkUp</h1>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search event"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="create-button" onClick={testCors}>
            <FaPlus />
          </button>
          {corsTest && <div className="cors-test-result">{corsTest}</div>}
        </header>

        <main className="main-content">
          <aside className="filters">
            <h2>Filter:</h2>
            {/* Add filter options here */}
          </aside>

          <section className="events-list">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-host">
                  <div className="host-avatar">
                    <FaUser />
                  </div>
                  <div className="host-info">
                    <p className="host-name">{event.host}</p>
                    <p className="common-interests">{event.commonInterests} common interests</p>
                  </div>
                  <button className="link-button">L</button>
                </div>
                
                <div className="event-details">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-location">
                    <FaMapMarkerAlt className="location-icon" />
                    {event.location}
                  </p>
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
};

export default HomePage; 