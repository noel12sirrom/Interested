declare global {
  interface Window {
    initMap: () => void;
    googleMapsLoaded: boolean;
    google: typeof google;
    addEventListener(type: 'googleMapsLoaded', listener: () => void): void;
    removeEventListener(type: 'googleMapsLoaded', listener: () => void): void;
    dispatchEvent(event: Event): boolean;
  }
}

export {}; 