FROM nodesource/xenial:4

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      xvfb \
 && rm -rf /var/lib/apt/lists/*;

WORKDIR /usr/src/app

ENV NODE_ENV dev

ADD package.json .

RUN npm install

COPY . .

RUN npm test
