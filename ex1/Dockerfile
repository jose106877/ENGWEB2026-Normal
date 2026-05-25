FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

ENV PORT=17000
EXPOSE 17000

CMD ["node", "server.js"]
