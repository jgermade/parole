
const { Parole } = require('../dist/cjs/parole.js')

module.exports = {
  resolved: Parole.resolve,
  rejected: Parole.reject,
  deferred: Parole.defer,
}
