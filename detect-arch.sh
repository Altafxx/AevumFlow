#!/bin/bash

# Detect host architecture
ARCH=$(uname -m)

# Convert architecture to Docker format
case $ARCH in
    x86_64)
        HOSTARCH="amd64"
        ;;
    aarch64)
        HOSTARCH="arm64"
        ;;
    arm64)
        HOSTARCH="arm64"
        ;;
    *)
        HOSTARCH="amd64"  # Default to amd64
        ;;
esac

# Export the architecture
export HOSTARCH

# Check if buildx is installed and set up
if ! docker buildx ls | grep -q "mybuilder"; then
    echo "Setting up Docker BuildX..."
    docker buildx create --name mybuilder --driver docker-container --bootstrap
    docker buildx use mybuilder
    docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
fi

# Get the command (up or build) and any additional arguments
CMD=$1
shift  # Remove the first argument, leaving the rest in $@

case $CMD in
    up)
        echo "Starting containers for architecture: $HOSTARCH"
        docker compose up -d --build "$@"
        ;;
    build)
        echo "Building containers for architecture: $HOSTARCH"
        docker compose build "$@"
        ;;
    *)
        echo "Usage: $0 {up|build} [additional-arguments]"
        exit 1
        ;;
esac
