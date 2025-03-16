declare global {
  interface Window {
    googleMapsLoaded: boolean;
    google: typeof google;
    addEventListener(type: 'googleMapsLoaded', listener: () => void): void;
    removeEventListener(type: 'googleMapsLoaded', listener: () => void): void;
    dispatchEvent(event: Event): boolean;
  }
}

declare namespace google.maps {
  class Map {
    constructor(element: HTMLElement, options: MapOptions);
    fitBounds(bounds: LatLngBounds): void;
    setCenter(latLng: LatLng): void;
    addListener(event: string, handler: (event: MapMouseEvent) => void): void;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    addListener(event: string, handler: () => void): void;
    setPosition(latLng: LatLng): void;
    getPosition(): LatLng;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    constructor();
    extend(latLng: LatLng): void;
  }

  class Geocoder {
    geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
  }

  interface MapOptions {
    center: LatLng | { lat: number; lng: number };
    zoom: number;
  }

  interface MarkerOptions {
    position: LatLng | { lat: number; lng: number };
    map: Map;
    title: string;
    animation?: Animation;
    draggable?: boolean;
  }

  interface GeocoderRequest {
    location: LatLng;
  }

  interface GeocoderResult {
    formatted_address: string;
    geometry: {
      location: LatLng;
    };
  }

  type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';

  interface MapMouseEvent {
    latLng: LatLng;
  }

  enum Animation {
    DROP
  }

  namespace places {
    class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
      addListener(eventName: string, handler: () => void): void;
      getPlace(): PlaceResult;
    }

    interface AutocompleteOptions {
      types?: string[];
    }

    interface PlaceResult {
      formatted_address?: string;
      geometry?: {
        location: LatLng;
      };
    }
  }

  namespace event {
    function removeListener(listener: any): void;
  }
} 