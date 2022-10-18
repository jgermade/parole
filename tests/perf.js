/* global Promise */

var Benchmark = require('benchmark')

var Parole = require('../src/parole')
var ParoleOld = require('../dist/parole')
var P = require('p-promise')

function addOne (x) {
  return x + 1
}

new Benchmark.Suite()
  .add('Parole', {
    defer: true,
    fn: function (deferred) {
      new Parole(function (resolve) {
        resolve(1)
      }).then(addOne).then(function () {
        deferred.resolve()
      })
    },
  })
  .add('Parole (legacy)', {
    defer: true,
    fn: function (deferred) {
      new ParoleOld(function (resolve) {
        resolve(1)
      }).then(addOne).then(function () {
        deferred.resolve()
      })
    },
  })
  .add('P', {
    defer: true,
    fn: function (deferred) {
      P(function (resolve) {
        resolve(1)
      }).then(addOne).then(function () {
        deferred.resolve()
      })
    },
  })
  .add('Promise [Native]', {
    defer: true,
    fn: function (deferred) {
      new Promise(function (resolve) {
        resolve(1)
      }).then(addOne).then(function () {
        deferred.resolve()
      })
    },
  })
  .on('cycle', function (event) {
    // eslint-disable-next-line
    console.log(String(event.target));
  })
  .run({
    async: true,
  })
