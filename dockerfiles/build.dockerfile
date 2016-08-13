FROM nodesource/xenial:4

# Setup everything necessary for building Linux and Windows amd64 and 32bit
# bianries for electron

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      software-properties-common \
      python-software-properties \
 && rm -rf /var/lib/apt/lists/*;

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF \
 && echo "deb http://download.mono-project.com/repo/debian wheezy main" \
    | tee /etc/apt/sources.list.d/mono-xamarin.list \
 && add-apt-repository ppa:ubuntu-wine/ppa -y \
 && dpkg --add-architecture i386 \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
      rpm \
      bsdtar \
      icnsutils \
      graphicsmagick \
      xz-utils \
      wine \
      wine1.8 \
      mono-devel \
      ca-certificates-mono \
      osslsigncode \
      gcc-multilib \
      g++-multilib \
 && rm -rf /var/lib/apt/lists/*;

WORKDIR /usr/src/app

ENV NODE_ENV dev

ADD package.json .

RUN npm install

COPY . .


CMD ["npm", "run", "build"]
