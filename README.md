This repo contains the frontend for [Korp](https://spraakbanken.gu.se/korp), a frontend for the IMS Open Corpus Workbench (CWB). The Korp frontend is a great tool for searching and and visualising natural language corpus data.

Korp is developed by [Språkbanken](https://spraakbanken.gu.se) at the University of Gothenburg, Sweden.

# Documentation:

- [Frontend documentation](../master/doc/frontend_devel.md)
- [Backend documentation](https://github.com/spraakbanken/korp-backend/)

# Getting started

1. Install `yarn`: `https://yarnpkg.com`
  - Korp must be developed with `yarn` rather than `npm`.

1. Building Korp
  - install all dependencies: `yarn`
  - build a dev version: `yarn build`
  - build a dist version: set `NODE_ENV=production`, then `yarn build`

1. Running Korp
  - run dev server: `yarn start:dev` or `yarn dev`
  - run dist server: `yarn start:dist` or `yarn start`

1. Running tests
  - run tests: `yarn test` or `yarn test:karma` or `yarn test:e2e`
  - (tests currently depend on Språkbanken's setup; they will not pass locally)

# webpack

We use *webpack* to build Korp and *webpack-dev-server* to run a local server. To include new code or resources, require them where needed:

```
nd = require("new-dependency")
nd.aFunction()
```

or

```
imgPath = require("img/image.png")
myTemplate = `<img src='${imgPath}'>`
```

Most dependencies are only specified in `app/index.js` and where needed added to the `window` object.

About the current loaders in in `webpack.config.js`:

  - `pug` and `html` files: all `src`-attributes in `<img>` tags and all `href`s in `<link>` tags will be loaded by webpack and replaced in the markup. Uses file loader so that requiring a `pug` or `html` file will give the path to the file back.
- `js` files are added to the bundle
- all images and fonts are added to the bundle using file loader and gives back a file path.
- `css` and `scss` are added to the bundle. `url`s will be loaded and replaced by webpack.

In addition to this, some specific files will simply be copied as is, for example Korp mode-files.

## webpack and configuration

We use `window.settings` to share needed configuration to `config.js` and `modes/common.js`.

`config.js` and `modes/common.js` are included in Webpacks dependency graph. Therefore it works to use `require` for anything needed, but only things that are in the configured location for settings.

`mode`-files are only loaded at runtime an any dependencies must be required in `modes/common.js` and then exported as a module as shown in the sample file `app/modes/common.js`.
