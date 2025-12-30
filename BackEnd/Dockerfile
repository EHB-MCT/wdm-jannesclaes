# BackEnd/Dockerfile
FROM node:18

WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install nodemon globally for development
RUN npm install -g nodemon

EXPOSE 5050

# Start with nodemon for development
CMD ["nodemon", "server.js"]