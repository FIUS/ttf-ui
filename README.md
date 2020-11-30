# ttf-ui
The ui component of the "Total Tolles Ferleihsystem" (our lending system)

## Deploying with docker
This project can be deployed with docker.
Just run `docker run -p 80:80 fius/ttf-ui`.

The container can be configured using the following environment variables with the `-e` flag:
`BACKEND_SERVER_URI`, `BACKEND_ROOT_RESOURCE_LOCATION`, `MAX_STRING_LENGTH`

They correspond to the three settings described in [Configuration](#configuration).

An apropriate `docker-compose.yml` would look like that:

```yml
version: "3"

networks:
  ttf:
    external: false

services:
  ttf-ui:
    image: fius/ttf-ui
    restart: always
    environment:
      BACKEND_SERVER_URI: https://example.com:5000
      BACKEND_ROOT_RESOURCE_LOCATION: /example/
      MAX_STRING_LENGTH: 160
    ports:
      - "8088:80"
    networks:
      - ttf
```

## Building
Change directory into `total_tolles_ferleihsystem` and:

For the first build run:
```shell
npm install
```

For all builds run:
```shell
npm run build
```

To serve for development run
```shell
npm run ng serve
```

### Cache busting for development
Use `--outputHashing=all`

### Standalone css files
Use `--extract-css`


## Configuration
To configure the fronted edit the file `webappSettings.json` either in `src/` or in the output folder of the build command (`dist`).

The following settings are supported:

| Name | Default | Description |
| ---- | ------- | ----------- |
| backendServerUri | `http://localhost:5000` | The uri of the backend server. This will be prepended to any API URI.
| backendRootResourceLocation | `/` | The location of the api root endpoint relative to the backendServerUri.
| maxStringLength | 188 | The maximum string length. This should be a little lower than the sting length supported by the backend. 
