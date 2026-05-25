FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

ENV PORT=19020
EXPOSE 19020

CMD ["node", "server.js"]
