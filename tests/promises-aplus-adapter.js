/* global process */

var Q = require( process.env.TEST_JS === 'min' ? '../q.min' : '../q' );

module.exports = {
  resolved: Q.resolve,
  rejected: Q.reject,
  deferred: Q.defer
};
