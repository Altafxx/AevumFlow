# Specify platform-specific builder
FROM --platform=$BUILDPLATFORM debian:11-slim AS builder

# Get architecture information
ARG TARGETARCH
ARG BUILDPLATFORM

# Install common dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
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
    lua5.1 \
    liblua5.1-0-dev

# Install ARM-specific dependencies if building for ARM64
RUN if [ "$TARGETARCH" = "arm64" ]; then \
        dpkg --add-architecture arm64 && \
        apt-get update && \
        apt-get install -y \
        crossbuild-essential-arm64 \
        gcc-aarch64-linux-gnu \
        g++-aarch64-linux-gnu \
        binutils-aarch64-linux-gnu \
        libc6-dev-arm64-cross \
        libpcre3-dev:arm64 \
        libssl-dev:arm64 \
        zlib1g-dev:arm64; \
    fi

# Verify cross-compiler installation
RUN if [ "$TARGETARCH" = "arm64" ]; then \
        aarch64-linux-gnu-gcc --version; \
    fi

# Set locale
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

WORKDIR /tmp

# Copy and extract modules from assets directory
COPY docker/assets/nginx-1.27.4.tar.gz \
     docker/assets/nginx-vod-module-1.33.tar.gz \
     docker/assets/lua-nginx-module-0.10.28.tar.gz \
     docker/assets/lua-resty-core-0.1.31.tar.gz \
     docker/assets/lua-resty-lrucache-0.13.tar.gz \
     docker/assets/luajit2-2.1-20231117.tar.gz \
     /tmp/

# Extract and install LuaJIT with architecture-specific flags
RUN tar xzf luajit2-2.1-20231117.tar.gz && \
    cd luajit2-2.1-20231117 && \
    if [ "$TARGETARCH" = "arm64" ]; then \
        make HOST_CC="gcc" CROSS=aarch64-linux-gnu- TARGET_SYS=Linux CROSS_ROOT=/usr/aarch64-linux-gnu && \
        make install PREFIX=/usr/local CROSS=aarch64-linux-gnu- TARGET_SYS=Linux CROSS_ROOT=/usr/aarch64-linux-gnu; \
    else \
        make && \
        make install PREFIX=/usr/local; \
    fi

# Extract all archives
RUN tar -zxf nginx-1.27.4.tar.gz && \
    tar -zxf nginx-vod-module-1.33.tar.gz && \
    tar -zxf lua-nginx-module-0.10.28.tar.gz && \
    tar -zxf lua-resty-core-0.1.31.tar.gz && \
    tar -zxf lua-resty-lrucache-0.13.tar.gz && \
    mv lua-nginx-module-0.10.28 lua-nginx-module && \
    mv lua-resty-core-0.1.31 lua-resty-core && \
    mv lua-resty-lrucache-0.13 lua-resty-lrucache

# Create OpenResty directory structure
RUN mkdir -p /usr/local/openresty/luajit/share/lua/5.1/resty \
    /usr/local/openresty/luajit/share/lua/5.1/ngx \
    /usr/local/openresty/luajit/lib/lua/5.1

# Install lua-resty-core and lua-resty-lrucache
WORKDIR /tmp/lua-resty-core
RUN cp -r lib/resty/* /usr/local/openresty/luajit/share/lua/5.1/resty/ && \
    cp -r lib/ngx/* /usr/local/openresty/luajit/share/lua/5.1/ngx/

WORKDIR /tmp/lua-resty-lrucache
RUN cp -r lib/resty/* /usr/local/openresty/luajit/share/lua/5.1/resty/

# Build NGINX with architecture-specific flags
WORKDIR /tmp/nginx-1.27.4

ENV LUAJIT_LIB=/usr/local/lib
ENV LUAJIT_INC=/usr/local/include/luajit-2.1

RUN if [ "$TARGETARCH" = "arm64" ]; then \
        export CC="aarch64-linux-gnu-gcc" && \
        export AR="aarch64-linux-gnu-ar" && \
        export LD="aarch64-linux-gnu-ld" && \
        export NM="aarch64-linux-gnu-nm" && \
        export RANLIB="aarch64-linux-gnu-ranlib" && \
        export STRIP="aarch64-linux-gnu-strip" && \
        export CROSS_ROOT=/usr/aarch64-linux-gnu && \
        ./configure --prefix=/etc/nginx \
        --conf-path=/etc/nginx/nginx.conf \
        --error-log-path=/var/log/nginx/error.log \
        --http-log-path=/var/log/nginx/access.log \
        --pid-path=/var/run/nginx.pid \
        --sbin-path=/usr/sbin/nginx \
        --modules-path=/etc/nginx/modules \
        --with-http_ssl_module \
        --with-http_v2_module \
        --with-http_stub_status_module \
        --with-http_realip_module \
        --with-file-aio \
        --with-threads \
        --with-stream \
        --with-cc="$CC" \
        --with-cc-opt="-O3 -I$CROSS_ROOT/include" \
        --with-ld-opt="-L$CROSS_ROOT/lib" \
        --add-dynamic-module=../lua-nginx-module \
        --add-module=../nginx-vod-module-1.33; \
    else \
        ./configure --prefix=/etc/nginx \
        --conf-path=/etc/nginx/nginx.conf \
        --error-log-path=/var/log/nginx/error.log \
        --http-log-path=/var/log/nginx/access.log \
        --pid-path=/var/run/nginx.pid \
        --sbin-path=/usr/sbin/nginx \
        --modules-path=/etc/nginx/modules \
        --with-http_ssl_module \
        --with-http_v2_module \
        --with-http_stub_status_module \
        --with-http_realip_module \
        --with-file-aio \
        --with-threads \
        --with-stream \
        --with-cc-opt="-O3 -mpopcnt" \
        --add-dynamic-module=../lua-nginx-module \
        --add-module=../nginx-vod-module-1.33; \
    fi

RUN make -j$(nproc) && make install

# Final stage
FROM --platform=$TARGETPLATFORM debian:11-slim

# Copy necessary files from builder
COPY --from=builder /etc/nginx /etc/nginx
COPY --from=builder /usr/sbin/nginx /usr/sbin/nginx
COPY --from=builder /usr/local/lib/libluajit-5.1.so.2 /usr/local/lib/
COPY --from=builder /usr/local/openresty /usr/local/openresty
COPY docker/nginx.conf /etc/nginx/nginx.conf

RUN ldconfig && \
    chmod 644 /etc/nginx/nginx.conf

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y \
    libpcre3 \
    zlib1g \
    libssl1.1 \
    ffmpeg \
    libaio1 \
    lua5.1 \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Create required directories and set permissions
RUN mkdir -p /var/log/nginx && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /var/run && \
    touch /var/run/nginx.pid && \
    chown -R nobody:nogroup /var/log/nginx /var/cache/nginx /var/run/nginx.pid

# Verify installation
RUN nginx -V

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
