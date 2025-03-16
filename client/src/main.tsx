import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import app from './firebase/config';

console.log('Script starting...');

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);

// Render the app
console.log('Rendering app...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 