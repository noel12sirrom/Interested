/// <reference path="../types/google-maps.d.ts" />
import React, { useEffect, useRef, useState } from 'react';
import { Event } from '../firebase/eventService';
import '../styles/Modal.css';

interface EventMapProps {
  events: Event[];
  onMarkerClick?: (eventId: string) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const EventMap: React.FC<EventMapProps> = ({
  events,
  onMarkerClick,
  center,
  zoom = 12
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: number;

    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        setLoadError(null);
      } else if (window.googleMapsLoaded) {
        // If googleMapsLoaded is true but google.maps is not available,
        // there might be an initialization issue
        timeoutId = window.setTimeout(checkGoogleMapsLoaded, 500);
      }
    };

    const handleMapsLoaded = () => {
      checkGoogleMapsLoaded();
    };

    // Check initial state
    checkGoogleMapsLoaded();

    // Listen for the load event
    window.addEventListener('googleMapsLoaded', handleMapsLoaded);

    // Set a timeout to show an error if maps doesn't load
    const errorTimeout = window.setTimeout(() => {
      if (!isGoogleMapsLoaded) {
        setLoadError('Failed to load Google Maps. Please refresh the page.');
      }
    }, 10000);

    return () => {
      window.removeEventListener('googleMapsLoaded', handleMapsLoaded);
      window.clearTimeout(timeoutId);
      window.clearTimeout(errorTimeout);
    };
  }, []);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current) return;

      try {
        const defaultCenter = center || { lat: 40.7128, lng: -74.0060 }; // Default to New York
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        setMap(mapInstance);

        // Add markers for events
        events.forEach((event) => {
          if (event.locationCoordinates?.lat && event.locationCoordinates?.lng) {
            const position = new google.maps.LatLng(
              event.locationCoordinates.lat,
              event.locationCoordinates.lng
            );
            const marker = new google.maps.Marker({
              position,
              map: mapInstance,
              title: event.title
            });

            marker.addListener('click', () => {
              if (onMarkerClick) {
                onMarkerClick(event.id);
              }
            });
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      const handleMapsLoaded = () => {
        initializeMap();
      };
      window.addEventListener('googleMapsLoaded', handleMapsLoaded);
      return () => {
        window.removeEventListener('googleMapsLoaded', handleMapsLoaded);
      };
    }

    return () => {
      if (map) {
        google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [mapRef.current, events]);

  // Update markers when events change
  useEffect(() => {
    if (!map || !bounds) return;

    try {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: google.maps.Marker[] = [];

      // Create new markers for each event
      events.forEach(event => {
        if (event.locationCoordinates) {
          const marker = new google.maps.Marker({
            position: event.locationCoordinates,
            map,
            title: event.title,
            animation: google.maps.Animation.DROP,
          });

          // Add click listener
          marker.addListener('click', () => {
            if (onMarkerClick) {
              onMarkerClick(event.id);
            }
          });

          newMarkers.push(marker);
          bounds.extend(new google.maps.LatLng(
            event.locationCoordinates.lat,
            event.locationCoordinates.lng
          ));
        }
      });

      setMarkers(newMarkers);

      // Fit bounds if there are events
      if (newMarkers.length > 0) {
        map.fitBounds(bounds);
      }
    } catch (error) {
      console.error('Error updating markers:', error);
      setLoadError('Error updating map markers. Please refresh the page.');
    }
  }, [map, events, bounds, onMarkerClick]);

  if (loadError) {
    return (
      <div className="map-error">
        <p>{loadError}</p>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    );
  }

  return (
    <div className="location-map-container">
      {!isGoogleMapsLoaded && (
        <div className="map-loading">
          <p>Loading map...</p>
        </div>
      )}
      <div ref={mapRef} className="location-map" style={{ opacity: isGoogleMapsLoaded ? 1 : 0 }} />
    </div>
  );
};

export default EventMap; 