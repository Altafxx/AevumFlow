# NGINX Kaltura VOD Microservice (Not so micro I guess)

A dockerized NGINX server configured with Kaltura VOD module for serving video content. This server handles VOD content streaming, JSON manifest delivery, and file upload capabilities.

## Features

- Video streaming with HLS support
- JSON manifest generation and serving
- File upload handling
- ARM64 architecture support
- Docker containerization

## Prerequisites

- Docker and Docker Compose
- Sufficient storage space for video content
- Linux/macOS environment (Windows users should use WSL2)

## Project Structure

Create the following directory structure in data folder:
```bash
mkdir -p vod json upload thumbnails
```

The directories serve the following purposes:
- `vod/`: Storage for video content
- `json/`: Location for JSON manifests
- `upload/`: Temporary storage for uploaded files (Not being used for now)
- `thumbnails/`: Temporary storage for thumbnails before sending to minio

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Altafxx/nginx-vod-microservice.git
cd nginx-kaltura-vod
```

2. Create required directories :
```bash
mkdir -p data/vod data/json data/upload data/thumbnails
```

3. Build and start the container:
```bash
docker-compose up -d --build
```

## Architecture Support

### x86_64 (Default)
No changes required - uses `debian:11-slim` as base image

### ARM64 (e.g., Raspberry Pi, never tried on Apple Silicon yet)
Update `USING_ARM` value to `TRUE` in .env file

## Configuration

The server configuration can be modified through:
- `nginx.conf`: NGINX server configuration
- `docker-compose.yml`: Container orchestration settings
- Environment variables in `.env` file (create from `.env.example`)

## Usage

### Accessing the Server

- Landing page: `http://localhost:3000/`
- Video content: `http://localhost:3000/video/<filename>.json/master.m3u8`

### Health Check

Sorry, health care isn't free.

<!-- ```bash
curl http://localhost:3000/health
``` -->

## Development

To make changes to the configuration:

1. Modify the necessary files
2. Rebuild and restart the container:
```bash
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

If you encounter issues:

1. Check container logs:
```bash
docker-compose logs
```

2. Verify directory permissions:
```bash
ls -la data/vod/ data/json/ data/upload/ data/thumbnails/
```

3. Ensure ports are available:
```bash
netstat -tuln | grep 3000
```

## License

Don't know yet which to choose, just use how ever you want. Probally will be using WTFPL in the future. Lol

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.