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
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(window.googleMapsLoaded || false);

  useEffect(() => {
    if (!isGoogleMapsLoaded) {
      const handleMapsLoaded = () => {
        setIsGoogleMapsLoaded(true);
      };
      window.addEventListener('googleMapsLoaded', handleMapsLoaded);
      return () => {
        window.removeEventListener('googleMapsLoaded', handleMapsLoaded);
      };
    }
  }, [isGoogleMapsLoaded]);

  useEffect(() => {
    if (!mapRef.current || !isGoogleMapsLoaded) return;

    const defaultCenter = center || { lat: 40.7128, lng: -74.0060 }; // Default to New York
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom,
    });
    setMap(mapInstance);

    // Create bounds object
    const boundsInstance = new google.maps.LatLngBounds();
    setBounds(boundsInstance);

    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [mapRef.current, isGoogleMapsLoaded]);

  // Update markers when events change
  useEffect(() => {
    if (!map || !bounds) return;

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
  }, [map, events, bounds, onMarkerClick]);

  return (
    <div className="location-map-container">
      <div ref={mapRef} className="location-map" />
    </div>
  );
};

export default EventMap; 