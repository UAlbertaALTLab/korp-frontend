# ALTLab Korp

This repo contains the [University of Alberta Language Technology Lab][ALTLab]'s (<abbr>ALTLab</abbr>) instance of [Korp][Korp], a tool for searching and visualizing natural language corpus data. Korp is developed by [Språkbanken][Spraakbanken] at the University of Gothenburg, Sweden.

[View the frontend documentation for Korp here.][docs]

## Getting started with developing Korp

1. Install [yarn][yarn]
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

1. Deployment
  - `dev`: commits to `dev` are automatically deployed to `korp.altlab.dev` (see [deploy-dev.yml](https://github.com/UAlbertaALTLab/korp-frontend/blob/dev/.github/workflows/deploy-dev.yml))
  - `main`: commits to `main` are automatically deployed to `korp.altlab.app` (see [deploy-prod.yml](https://github.com/UAlbertaALTLab/korp-frontend/blob/dev/.github/workflows/deploy-prod.yml))

## Configuration

Korp uses `window.settings` to share needed configuration to `config.js` and `modes/common.js`.

`config.js` and `modes/common.js` are included in webpack's dependency graph. Therefore it works to use `require` for anything needed, but only things that are in the configured location for settings.

`mode`-files are only loaded at runtime an any dependencies must be required in `modes/common.js` and then exported as a module as shown in the sample file `app/modes/common.js`.

## webpack

Korp uses *webpack* to build Korp and *webpack-dev-server* to run a local server. To include new code or resources, require them where needed:

```
nd = require(`new-dependency`)
nd.aFunction()
```

or

```
imgPath = require(`img/image.png`)
myTemplate = `<img src='${imgPath}'>`
```

Most dependencies are only specified in `app/index.js` and where needed added to the `window` object.

About the current loaders in in `webpack.config.js`:

- `pug` and `html` files: all `src`-attributes in `<img>` tags and all `href`s in `<link>` tags will be loaded by webpack and replaced in the markup. Uses file loader so that requiring a `pug` or `html` file will give the path to the file back.
- `js` files are added to the bundle.
- All images and fonts are added to the bundle using file loader and gives back a file path.
- `css` and `scss` are added to the bundle. `url`s will be loaded and replaced by webpack.

In addition to this, some specific files will simply be copied as is, for example Korp mode-files.

<!-- Links -->
[ALTLab]:       https://altlab.artsrn.ualberta.ca/
[docs]:         https://github.com/spraakbanken/korp-frontend/blob/master/doc/frontend_devel.md
[Korp]:         https://github.com/spraakbanken/korp-frontend
[Spraakbanken]: https://spraakbanken.gu.se
[yarn]:         https://yarnpkg.com
