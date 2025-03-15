# React + Express Application

This is a full-stack application using React for the frontend and Express for the backend.

## Project Structure

```
.
├── client/          # React frontend
│   ├── src/         # Source files
│   └── ...
└── server/          # Express backend
    ├── src/         # Source files
    └── ...
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Install dependencies for both client and server:
```bash
npm install
```

### Development

To run both the client and server in development mode:

```bash
npm run dev
```

This will start:
- Frontend at http://localhost:5173
- Backend at http://localhost:3000

### Production Build

To create a production build:

```bash
npm run build
```

### Running in Production

To start the application in production mode:

```bash
npm start
```

## Features

- React 18 with TypeScript
- Vite for fast development and building
- Express backend with TypeScript
- CORS enabled
- Development proxy configuration
- Hot module replacement in development 