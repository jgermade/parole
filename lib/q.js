
module.exports = require('./qizer')( require('./promise-methods')(global.Promise) || require('./promise-polyfill') );
