# NGINX Kaltura VOD
A dockerized NGINX server that serves VOD content from a Kaltura server. The server is configured to serve VOD content from a Kaltura server and also to serve a JSON file that contains the list of available VOD content. The server is also configured to accept file uploads and store them in the upload folder.

## Pre-requisites:
- Docker
- Create vod, json and upload folder in the root directory of the project

## Run the container:
```
docker-compose up -d --build
```