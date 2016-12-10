/* global process */

var Parole = require( process.env.TEST_JS === 'min' ? '../parole.min' : '../parole' );

module.exports = {
  resolved: Parole.resolve,
  rejected: Parole.reject,
  deferred: Parole.defer
};
