FROM alpine:3.11

WORKDIR     /tmp/ffmpeg

ENV SOFTWARE_VERSION="4.0"
ENV SOFTWARE_VERSION_URL="http://ffmpeg.org/releases/ffmpeg-${SOFTWARE_VERSION}.tar.bz2"
ENV BIN="/usr/bin"

RUN cd && \
  apk update && \
  apk upgrade && \
  apk add \
  nodejs \
  npm \
  tzdata \
  coreutils \
  freetype-dev \
  gnutls-dev \
  lame-dev \
  libass-dev \
  libogg-dev \
  libtheora-dev \
  libvorbis-dev \
  libvpx-dev \
  libwebp-dev \
  libssh2 \
  opus-dev \
  rtmpdump-dev \
  x264-dev \
  x265-dev \
  yasm-dev && \
  apk add --no-cache --virtual \
  .build-dependencies \
  build-base \
  bzip2 \
  coreutils \
  gnutls \
  nasm \
  tar \
  x264 && \
  DIR=$(mktemp -d) && \
  cd "${DIR}" && \
  wget "${SOFTWARE_VERSION_URL}" && \
  tar xjvf "ffmpeg-${SOFTWARE_VERSION}.tar.bz2" && \
  cd ffmpeg* && \
  PATH="$BIN:$PATH" && \
  ./configure --help && \
  ./configure --bindir="$BIN" --disable-debug \
  --disable-doc \
  --disable-ffplay \
  --enable-avresample \
  --enable-gnutls \
  --enable-gpl \
  --enable-libass \
  --enable-libfreetype \
  --enable-libmp3lame \
  --enable-libopus \
  --enable-librtmp \
  --enable-libtheora \
  --enable-libvorbis \
  --enable-libvpx \
  --enable-libwebp \
  --enable-libx264 \
  --enable-libx265 \
  --enable-nonfree \
  --enable-postproc \
  --enable-small \
  --enable-version3 && \
  make -j4 && \
  make install && \
  make distclean && \
  rm -rf "${DIR}"  && \
  cp /usr/share/zoneinfo/Europe/Oslo /etc/localtime && \
  apk del --purge .build-dependencies && \
  rm -rf /var/cache/apk/*

RUN mkdir -p /record/data
WORKDIR /record

COPY dist /record
COPY docker/.env /record/.env
COPY docker/package.json /record/package.json
ADD run.sh run.sh
ADD entrypoint.sh entrypoint.sh
RUN chmod +x run.sh entrypoint.sh && \
  npm install

EXPOSE 8080
ENTRYPOINT [ "./entrypoint.sh" ]
