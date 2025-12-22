# BackEnd/Dockerfile
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# We gebruiken nodemon zodat je server herstart als je code aanpast
RUN npm install -g nodemon

EXPOSE 5050

# Start command
CMD ["nodemon", "server.js"]