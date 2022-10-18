
module.exports = {
  resolved: x => Promise.resolve(x),
  rejected: reason => Promise.reject(reason),
  deferred () {
    const deferred = {}
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve
      deferred.reject = reject
    })
    return deferred
  },
}
