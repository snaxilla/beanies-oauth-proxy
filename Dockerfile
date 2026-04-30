FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY server.mjs ./

EXPOSE 3000

CMD ["npm", "start"]
