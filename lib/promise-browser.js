
if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['$q'], function () {
      return require('./promise-q');
    });
} else {
    // Browser globals
    global.$q = require('./promise-q');
}
