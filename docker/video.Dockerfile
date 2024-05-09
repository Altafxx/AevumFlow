FROM debian:11-slim AS builder

RUN apt update && apt install -y \
    build-essential \
    git \
    libpcre3-dev \
    libssl-dev \
    zlib1g-dev \
    ffmpeg \
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
    wget \ 
    bash
WORKDIR /tmp
RUN wget http://nginx.org/download/nginx-1.25.4.tar.gz
RUN tar -zxvf nginx-1.25.4.tar.gz
RUN wget https://github.com/kaltura/nginx-vod-module/archive/refs/tags/1.33.tar.gz
RUN tar -zxvf 1.33.tar.gz
WORKDIR /tmp/nginx-1.25.4
RUN ./configure \
    --prefix=/etc/nginx \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --pid-path=/run/nginx.pid \
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
RUN make && make install
WORKDIR /etc/nginx
# COPY vod /etc/nginx/vod
# COPY json /etc/nginx/json
# RUN ln -s /mnt/vod /etc/nginx/vod
# RUN ln -s /mnt/json /etc/nginx/json
RUN apt remove -y build-essential git wget && \
    apt autoremove -y && \
    rm -rf /var/lib/apt/lists/*
# RUN ln -s /app/vod /etc/nginx/vod
# RUN ln -s /app/json /etc/nginx/json 
COPY config/nginx.conf /etc/nginx/nginx.conf
RUN chmod 644 /etc/nginx/nginx.conf
RUN nginx -V > /tmp/nginx_version
RUN cat /tmp/nginx_version
# EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]


