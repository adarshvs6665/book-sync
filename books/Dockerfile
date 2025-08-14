FROM node:18-alpine

WORKDIR /app/books

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD ["npm", "run", "dev"]