FROM node:18-slim

WORKDIR /usr/src/app/backend

COPY package*.json ./

RUN npm install

# Copiar código TypeScript compilado
COPY dist/ ./dist/
COPY .env ./

EXPOSE 3001

CMD [ "npm", "start" ]