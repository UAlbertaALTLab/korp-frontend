if (process.env.NODE_ENV === `production`) {
  module.exports = require(`./webpack.prod.js`);
} else {
  module.exports = require(`./webpack.dev.js`);
}
