
const { Parole } = require('../dist/cjs/parole')

module.exports = {
  resolved: Parole.resolve,
  rejected: Parole.reject,
  deferred: Parole.defer,
}
