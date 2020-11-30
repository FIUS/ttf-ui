# source environment
FROM scratch AS source

COPY docker/ /docker/
COPY angular.json package.json package-lock.json tsconfig.json /app/
COPY src /app/src

# build environment
FROM node:current AS builder

COPY --from=source /app/ /app/

WORKDIR /app

RUN set -x; npm install
RUN set -x; npm run build --prod --extract-css

# production
FROM nginx:mainline-alpine

# Install dockerize for the prestart action
RUN apk add --no-cache openssl
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY --from=source docker/webappSettings.json.tmpl /webappSettings.json.tmpl
COPY --from=source docker/prestart.sh /docker-entrypoint.d/10-ttf-ui-prestart.sh

COPY --from=builder /app/dist/ /usr/share/nginx/html/

RUN chown -R nginx:nginx /usr/share/nginx/html/
RUN chmod +x /docker-entrypoint.d/10-ttf-ui-prestart.sh

ENV BACKEND_SERVER_URI http://localhost:5000
ENV BACKEND_ROOT_RESOURCE_LOCATION /
ENV MAX_STRING_LENGTH 188
