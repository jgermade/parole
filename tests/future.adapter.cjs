
const { Future } = require('../dist/cjs/future')

module.exports = {
  deferred () {
    const deferred = {}
    deferred.promise = new Future((resolve, reject) => {
      deferred.resolve = resolve
      deferred.reject = reject
    })
    return deferred
  },
}
