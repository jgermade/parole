/* global process */

(function (root, factory) {
  if( typeof exports === 'object' && typeof module !== 'undefined' ) {
    // CommonJS
    module.exports = factory();
  } else if( typeof define === 'function' && define.amd ) {
      // AMD. Register as an anonymous module.
      define([], factory);
  } else {
      // Browser globals
      root.Parole = factory();
  }
})(this, function () {

  var nextTick = typeof process === 'object' && typeof process.nextTick === 'function' ?
    process.nextTick :
    (function(global, prefixes, i, fn) {
      for( i = prefixes.length - 1; i >= 0 ; i-- ) {
        fn = global[prefixes[i++] + 'equestAnimationFrame'];
        if( fn instanceof Function ) return fn;
      }
      return global.setImmediate || global.setTimeout;
    })( typeof window === 'object' ? window : this, 'oR msR mozR webkitR r'.split(' ') );

  function isThenable (x) {
    return ( typeof x === 'object' || x instanceof Function ) && 'then' in x;
  }

  function runHandler (then, is_fulfilled, value, resolve, reject) {
    if( typeof then === 'function' ) {
      try {
        resolve( then(value) );
      } catch(reason) {
        reject( reason );
      }
    } else if( is_fulfilled ) resolve(value);
    else reject(value);
  }

  function runThenable (then, p, x, resolve, reject) {
    var executed = false;
    try {
      then.call(x, function (value) {
        if( executed ) return;
        executed = true;
        xThen(p, value, true, resolve, reject);
      }, function (reason) {
        if( executed ) return;
        executed = true;
        xThen(p, reason, false, resolve, reject);
      });
    } catch(err) {
      if( executed ) return;
      xThen(p, err, false, resolve, reject);
    }
  }

  function xThen (p, x, fulfilled, resolve, reject) {
    var then;

    if( x && ( typeof x === 'object' || typeof x === 'function' ) ) {
      try {
        if( x === p ) throw new TypeError('A promise can not be resolved by itself');
        then = x.then;

        if( fulfilled && typeof then === 'function' ) {
          runThenable(then, p, x, resolve, reject);
        } else {
          (fulfilled ? resolve : reject)(x);
        }
      } catch (reason) {
        reject(reason);
      }
    } else {
      (fulfilled ? resolve : reject)(x);
    }
  }

  function Parole (resolver) {
    if( !(this instanceof Parole) ) return new Parole(resolver);

    var p = this,
        runQueue = function (is_fulfilled, result, queue) {
          if( p.completed ) return;
          p.completed = true;

          p.fulfilled = is_fulfilled;
          p.value = result;

          nextTick(function () {
            for( var i = 0, n = queue.length ; i < n ; i++ ) {
              queue[i]();
            }
          }, 0);
        },
        reject = function (reason) {
          runQueue(false, reason, p.queue);
        };

    p.queue = [];

    resolver(function (value) {
      xThen(p, value, true, function (result) {
        runQueue(true, result, p.queue);
      }, reject);
    }, reject);
  }

  Parole.prototype.then = function (onFulfilled, onRejected) {
    var p = this;
    return new Parole(function (resolve, reject) {

      function complete () {
        runHandler( p.fulfilled ? onFulfilled : onRejected, p.fulfilled, p.value, resolve, reject );
      }

      if( !p.completed ) {
        p.queue.push(complete);
      } else {
        nextTick(complete);
      }

    });
  };

  Parole.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
  };

  // Promise methods

  Parole.defer = function () {
    var deferred = {};
    deferred.promise = new Parole(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  };

  Parole.when = function (x) { return ( x && x.then ) ? x : Parole.resolve(x); };

  Parole.resolve = function (value) {
    return new Parole(function (resolve) {
      resolve(value);
    });
  };

  Parole.reject = function (value) {
    return new Parole(function (resolve, reject) {
      reject(value);
    });
  };

  Parole.all = function (promises) {
    var waiting_promises = promises.length;
    return new Parole(function (resolve, reject) {
      var results = new Array(waiting_promises);
      promises.forEach(function (promise, i) {
        var addresult = function (result) {
          results[i] = result;
          waiting_promises--;
          if( !waiting_promises ) resolve(results);
        };
        if( isThenable(promise) ) promise.then.call(promise, addresult, reject);
        else addresult(promise);
      });
    });
  };

  Parole.race = function (promises) {
    return new Parole(function (resolve, reject) {
      promises.forEach(function (promise) {
        if( isThenable(promise) ) promise.then.call(promise, resolve, reject);
        else resolve(promise);
      });
    });
  };

  return Parole;

});
