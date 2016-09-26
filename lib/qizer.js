
module.exports = function (Promise) {

  function q (executor) {
    return new Promise(executor);
  }

  require('./promise-methods')(q)(q, true);

  q.when = function (p) { return ( p && p.then ) ? p : Promise.resolve(p); };
  q.usePolyfill = function () {
  	Promise = require('./promise-polyfill');
  };

  return q;

};
