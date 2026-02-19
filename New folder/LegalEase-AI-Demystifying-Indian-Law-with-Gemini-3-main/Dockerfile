# Use a lightweight Node.js environment
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the app for production (Vite creates a 'dist' folder)
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Serve the app on port 8080 (Required for Cloud Run)
CMD ["serve", "-s", "dist", "-l", "8080"]
