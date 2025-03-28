FROM node:18-slim AS builder

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    sqlite3 \
    python3-pip \
    libssl-dev \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV BETTER_SQLITE3_FORCE_SYSTEM_SQLITE=true

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm install -g ts-node typescript

RUN npm rebuild better-sqlite3 --build-from-source

RUN npx prisma generate

RUN npm run build


FROM node:18-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public 
COPY --from=builder /app/prisma ./prisma 
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/.env ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/videos || exit 1

CMD ["npm", "run", "start"]
