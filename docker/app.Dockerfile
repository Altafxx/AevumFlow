FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    sqlite3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create app directory and volume mount points
WORKDIR /app
RUN mkdir -p /mnt/vod /mnt/json /mnt/upload

# Set environment for better-sqlite3
ENV BETTER_SQLITE3_FORCE_SYSTEM_SQLITE=true

# Install dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Install global tools
RUN npm install -g ts-node typescript

# Rebuild native modules
RUN npm rebuild better-sqlite3 --build-from-source

# Optional: Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start application
CMD ["ts-node", "src/index.ts"]