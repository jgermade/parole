
const { Future } = require('../dist/cjs/future.js')

module.exports = {
  resolved: x => new Future(resolve => resolve(x)),
  rejected: reason => new Future((_, reject) => reject(reason)),
  deferred () {
    const deferred = {}
    deferred.promise = new Future((resolve, reject) => {
      deferred.resolve = resolve
      deferred.reject = reject
    })
    return deferred
  },
}
