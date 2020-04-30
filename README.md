# Scromble

Online multi-player VueJS and firebase scrabble. Available at [scromble.web.app](http://scromble.web.app).

## Project setup
```
yarn install
```

Add service key at *functions/src/keys.ts*. Also add property *project_owner_email* to the exported object.

Add Firebase SDK object and initalize and export database, functions and auth in *src/firebaseInit.js*.


### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

