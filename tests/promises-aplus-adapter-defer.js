
var defer = require('../src/defer');

module.exports = {
  resolved: defer.resolve,
  rejected: defer.reject,
  deferred: function () {
    var deferred = {};
    deferred.promise = defer(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  }
};
