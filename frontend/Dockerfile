FROM node:latest as builder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

ENV SASS_PATH=./node_modules
RUN npm install
RUN npm run build

ENTRYPOINT ["npm", "run", "build"]