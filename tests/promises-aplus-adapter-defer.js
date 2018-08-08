
var defer = require('../src/defer');

module.exports = {
  resolved: defer.resolve,
  rejected: defer.reject,
  deferred: defer
};
