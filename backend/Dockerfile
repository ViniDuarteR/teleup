FROM node:18-alpine

WORKDIR /usr/src/app/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD [ "npm", "start" ]