
module.exports = require('./qizer')( global.Promise ? require('./promise-methods')(global.Promise) : require('./promise-polyfill') );
