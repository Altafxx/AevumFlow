ARG USING_ARM=false

# First stage - Builder
FROM debian:11-slim AS builder
ARG USING_ARM

# Install architecture-specific dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    git \
    pkg-config \
    libpcre3-dev \
    libssl-dev \
    zlib1g-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libvorbis-dev \
    libspeexdsp-dev \
    libtheora-dev \
    libsnappy-dev \
    libogg-dev \
    libfreetype6-dev \
    libgd-dev \
    libvpx-dev \
    libaio-dev \
    ffmpeg \
    libc6-dev \
    linux-libc-dev \
    ${USING_ARM:+"gcc-aarch64-linux-gnu"}

# Set locale
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

WORKDIR /tmp

# Download and extract nginx
RUN wget https://nginx.org/download/nginx-1.27.4.tar.gz && \
    tar -zxvf nginx-1.27.4.tar.gz

# Download and extract vod module
RUN wget https://github.com/kaltura/nginx-vod-module/archive/refs/tags/1.33.tar.gz && \
    tar -zxvf 1.33.tar.gz

WORKDIR /tmp/nginx-1.27.4

# Configure and build nginx
RUN ./configure --prefix=/etc/nginx \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --pid-path=/var/run/nginx.pid \
    --sbin-path=/usr/sbin/nginx \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-http_stub_status_module \
    --with-http_realip_module \
    --with-file-aio \
    --with-threads \
    --with-stream \
    --with-cc-opt="-O3 -mpopcnt" \
    --add-module=../nginx-vod-module-1.33

RUN make -j$(nproc) && make install

WORKDIR /etc/nginx

COPY docker/nginx.conf /etc/nginx/nginx.conf
RUN chmod 644 /etc/nginx/nginx.conf

# Final stage
FROM debian:11-slim
ARG USING_ARM

# Copy only necessary files from builder
COPY --from=builder /etc/nginx /etc/nginx
COPY --from=builder /usr/sbin/nginx /usr/sbin/nginx

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y \
    libpcre3 \
    zlib1g \
    libssl1.1 \
    ffmpeg \
    libaio1 && \
    rm -rf /var/lib/apt/lists/*

# Create required directories and set permissions
RUN mkdir -p /var/log/nginx && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /var/run && \
    touch /var/run/nginx.pid && \
    chown -R nobody:nogroup /var/log/nginx /var/cache/nginx /var/run/nginx.pid

# Verify installation
RUN nginx -V

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]