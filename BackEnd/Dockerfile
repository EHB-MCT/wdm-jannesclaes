FROM node:latest

COPY package*.json .

RUN npm install --quiet

COPY ./ ./

CMD ["npm", "start"]