# Stage 1: Build the React application
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client code
COPY client/ .

# Build the application
RUN npm run build

# Stage 2: Serve the built application
FROM nginx:alpine

# Copy the build output from stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration (if you have a custom one)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 