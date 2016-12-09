
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.$q = factory();
  }
}(this, function () {

  function runHandler (fn, deferred, x, fulfilled) {
    if( typeof fn === 'function' ) {
      try {
        deferred.resolve( fn(x) );
      } catch(reason) {
        deferred.reject( reason );
      }
    } else {
      deferred[ fulfilled ? 'resolve' : 'reject' ](x);
    }
  }

  function resolvePromise (p, x, fulfilled) {
    if( p.resolved ) {
      return;
    }
    p.resolved = true;

    p.result = x;
    p.fulfilled = fulfilled || false;

    var queue = p.queue.splice(0);
    p.queue = null;

    setTimeout(function () {
      for( var i = 0, n = queue.length ; i < n ; i++ ) {
        runHandler( queue[i][fulfilled ? 0 : 1], queue[i][2], x, fulfilled );
      }
    }, 0);
  }

  function runThenable (then, p, x) {
    var executed = false;
    try {
      then.call(x, function (value) {
        if( executed ) return;
        executed = true;
        xThen(p, value, true);
      }, function (reason) {
        if( executed ) return;
        executed = true;
        xThen(p, reason, false);
      });
    } catch(err) {
      if( executed ) return;
      xThen(p, err, false);
    }
  }

  function xThen (p, x, fulfilled) {
    var then;

    if( x && ( typeof x === 'object' || typeof x === 'function' ) ) {
      try {
        then = x.then;

        if( fulfilled && typeof then === 'function' ) {
          runThenable(then, p, x);
        } else {
          resolvePromise(p, x, fulfilled);
        }
      } catch (reason) {
        resolvePromise(p, reason, false);
      }
    } else {
      resolvePromise(p, x, fulfilled);
    }
  }

  function resolveProcedure (p, x, fulfilled) {
    if( p.resolving ) return;
    p.resolving = true;

    if( x === p.promise ) {
      fulfilled = false;
      x = new TypeError('A promise can not be resolved by itself');
    }

    xThen(p, x, fulfilled);
  }

  function Q (resolver) {
    if( !(this instanceof Q) ) {
      return new Q(resolver);
    }

    if( typeof resolver !== 'function' ) {
      throw new TypeError('Promise resolver ' + resolver + ' is not a function');
    }

    var p = {
      queue: [],
      promise: this
    };

    this.__promise = p;

    try {
      resolver(function (value) {
        resolveProcedure(p, value, true);
      }, function (reason) {
        resolveProcedure(p, reason, false);
      });
    } catch (reason) {
      resolveProcedure(p, reason, false);
    }

  }

  Q.prototype.then = function (onFulfilled, onRejected) {
    var p = this.__promise,
        deferred = Q.defer();

    if( p.queue ) {
      p.queue.push([onFulfilled, onRejected, deferred]);
    } else {
      setTimeout(function () {
        runHandler( p.fulfilled ? onFulfilled : onRejected, deferred, p.result, p.fulfilled );
      }, 0);
    }

    return deferred.promise;
  };

  Q.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
  };

  // Promise methods

  function each (iterable, handler) {
    for( var i = 0, n = iterable.length; i < n ; i++ ) {
      handler(iterable[i], i);
    }
  }

  Q.defer = function () {
    var deferred = {};
    deferred.promise = new Q(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  };

  Q.when = function (x) { return ( x && x.then ) ? x : Q.resolve(x); };

  Q.resolve = function (value) {
    return new Q(function (resolve) {
      resolve(value);
    });
  };

  Q.reject = function (value) {
    return new Q(function (resolve, reject) {
      reject(value);
    });
  };

  Q.all = function (iterable) {
    return new Q(function (resolve, reject) {
      var pending = iterable.length,
          results = [];
      each(iterable, function (_promise, i) {

        ( _promise.then ? _promise : Q.resolve(_promise) ).then(function (result) {
          results[i] = result;
          if( --pending === 0 ) {
            resolve(results);
          }
        }, function (reason) {
          if( pending !== -1 ) {
            pending === -1;
            reject(reason);
          }
        });
      });
    });
  };

  Q.race = function (iterable) {
    return new Q(function (resolve, reject) {
      var done = false;

      each(iterable, function (_promise) {
        if( done ) {
          return;
        }
        ( _promise.then ? _promise : Q.resolve(_promise) ).then(function (result) {
          if( !done ) {
            done = true;
            resolve(result);
          }
        }, function (reason) {
          if( !done ) {
            done = true;
            reject(reason);
          }
        });
      });
    });
  };

  return Q;

}));
