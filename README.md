# ttf-ui
The ui component of the "Total Tolles Ferleihsystem" (our lending system)

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
