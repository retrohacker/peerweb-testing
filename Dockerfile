FROM nodesource/node:5.10.0

WORKDIR /usr/src/app
ENV NODE_ENV production

ADD package.json .

RUN npm install

ADD * ./

CMD ["npm", "run", "build"]
