
const { Parole } = require('../dist/parole.js')

module.exports = {
  resolved: Parole.resolve,
  rejected: Parole.reject,
  deferred: Parole.defer,
}
