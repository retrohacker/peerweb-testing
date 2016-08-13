FROM nodesource/xenial:4

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      xvfb \
      libgtk2.0.0 \
      libnotify4 \
      libgconf-2-4 \
      libnss3 \
      libnss3-dbg \
      libnspr4 \
      libasound2 \
 && rm -rf /var/lib/apt/lists/*;

WORKDIR /usr/src/app

ENV NODE_ENV dev

ADD package.json .

RUN npm install

COPY . .

RUN npm test
