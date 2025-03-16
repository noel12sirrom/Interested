import React, { useEffect, useRef, useState } from 'react';
import '../styles/Modal.css';

interface LocationSearchMapProps {
  onLocationSelect: (location: string, coordinates: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  initialAddress?: string;
  searchRadius?: number; // in kilometers
}

const LocationSearchMap: React.FC<LocationSearchMapProps> = ({
  onLocationSelect,
  initialLocation,
  initialAddress,
  searchRadius = 10
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [searchInput, setSearchInput] = useState(initialAddress || '');
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is loaded
    if (window.googleMapsLoaded) {
      setIsGoogleMapsLoaded(true);
    } else {
      // Listen for the Google Maps load event
      window.addEventListener('googleMapsLoaded', () => {
        setIsGoogleMapsLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    // Initialize map only after Google Maps is loaded
    if (mapRef.current && !map && isGoogleMapsLoaded) {
      const defaultLocation = initialLocation || { lat: 40.7128, lng: -74.0060 }; // Default to New York
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 12,
      });
      setMap(mapInstance);

      // Create marker
      const markerInstance = new google.maps.Marker({
        position: defaultLocation,
        map: mapInstance,
        draggable: true,
        title: 'Selected Location'
      });
      setMarker(markerInstance);

      // Initialize search box
      const input = document.getElementById('location-search') as HTMLInputElement;
      if (input) {
        const searchBoxInstance = new google.maps.places.Autocomplete(input, {
          types: ['address'],
        });
        setSearchBox(searchBoxInstance);

        // Handle place selection
        searchBoxInstance.addListener('place_changed', () => {
          const place = searchBoxInstance.getPlace();
          if (place.geometry?.location) {
            const location = place.geometry.location;
            mapInstance.setCenter(location);
            markerInstance.setPosition(location);
            onLocationSelect(place.formatted_address || '', {
              lat: location.lat(),
              lng: location.lng(),
            });
          }
        });
      }

      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLatLng = new google.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            );
            setUserLocation(userLatLng);
            mapInstance.setCenter(userLatLng);
            markerInstance.setPosition(userLatLng);
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        );
      }
    }

    // Cleanup
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [mapRef, map, initialLocation, isGoogleMapsLoaded]);

  // Handle map click
  useEffect(() => {
    if (map && marker) {
      const clickListener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
        const location = event.latLng;
        marker.setPosition(location);
        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            onLocationSelect(results[0].formatted_address, {
              lat: location.lat(),
              lng: location.lng(),
            });
          }
        });
      });

      return () => {
        google.maps.event.removeListener(clickListener);
      };
    }
  }, [map, marker]);

  // Handle marker drag
  useEffect(() => {
    if (marker) {
      const dragListener = marker.addListener('dragend', () => {
        const position = marker.getPosition();
        if (position) {
          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              onLocationSelect(results[0].formatted_address, {
                lat: position.lat(),
                lng: position.lng(),
              });
            }
          });
        }
      });

      return () => {
        google.maps.event.removeListener(dragListener);
      };
    }
  }, [marker]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <div className="location-map-container">
      <input
        id="location-search"
        type="text"
        className="location-search-input"
        placeholder="Search for a location"
        value={searchInput}
        onChange={handleSearchChange}
      />
      <div ref={mapRef} className="location-map" />
    </div>
  );
};

export default LocationSearchMap; 