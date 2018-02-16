'use strict';

var Benchmark = require('benchmark');
var Parole = require('./parole');

var suite = new Benchmark.Suite();

function addOne(x) {
  return x + 1;
}

suite
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
  .on('cycle', function(event) {
    // eslint-disable-next-line
    console.log(String(event.target));
  })
  .run({
    async:true
  });
