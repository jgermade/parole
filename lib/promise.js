
module.exports = require('./promise-addons')(global.Promise || require('./promise-polyfill'));
