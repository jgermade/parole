/* global Promise */

var Benchmark = require('benchmark');

var Parole = require('./src/parole');
var ParoleOld = require('./parole');
var _defer = require('./src/defer');

function addOne(x) {
  return x + 1;
}

new Benchmark.Suite()
  .add('_defer', {
    'defer': true,
    'fn': function(deferred) {
      _defer(function (resolve) {
        resolve(1);
      }).then(addOne).then(function() {
        deferred.resolve();
      });
    }
  })
  .add('Promise [Native]', {
    'defer': true,
    'fn': function(deferred) {
      new Promise(function (resolve) {
        resolve(1);
      }).then(addOne).then(function() {
        deferred.resolve();
      });
    }
  })
  .add('Parole', {
    'defer': true,
    'fn': function(deferred) {
      new Parole(function (resolve) {
        resolve(1);
      }).then(addOne).then(function() {
        deferred.resolve();
      });
    }
  })
  .add('ParoleOld', {
    'defer': true,
    'fn': function(deferred) {
      new ParoleOld(function (resolve) {
        resolve(1);
      }).then(addOne).then(function() {
        deferred.resolve();
      });
    }
  })
  .on('cycle', function(event) {
    // eslint-disable-next-line
    console.log(String(event.target));
  })
  .run({
    async:true
  });
