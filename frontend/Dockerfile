FROM node:latest as builder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

ENV SASS_PATH=./node_modules
RUN npm install
RUN npm run build


FROM nginx:alpine
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]