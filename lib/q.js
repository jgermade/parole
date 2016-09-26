
module.exports = require('./qizer')( global.Promise ? require('./promise-methods')(function (executor) { return new global.Promise(executor); })(global.Promise) : require('./promise-polyfill') );
