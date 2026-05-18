FROM node:20-slim

WORKDIR /app

# Build dependencies for better-sqlite3 native module
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
