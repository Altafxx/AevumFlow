FROM node:slim

RUN apt update && apt install -y \
    python3-pip
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm install -g ts-node
RUN npm rebuild better-sqlite3
# RUN npm install -D typescript
RUN mkdir /mnt/vod /mnt/json /mnt/upload
# RUN tsc
# COPY tsconfig.json .

# CMD ["ts-node", "src/index.ts"]
