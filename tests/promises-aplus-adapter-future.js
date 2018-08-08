
var future = require('../src/future');

module.exports = {
  resolved: future.resolve,
  rejected: future.reject,
  deferred: future.defer
};
