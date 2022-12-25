FROM node:16.14.0 as build-stage

WORKDIR /app
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
COPY ./public /app/public
COPY ./server /app/server
COPY ./src /app/src
COPY ./roseer_entrypoint.sh /app/roseer_entrypoint.sh
RUN npm install
RUN npm run build

FROM nginx:stable
COPY --from=build-stage /app/build /usr/share/nginx/html

