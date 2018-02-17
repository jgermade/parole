
// const nextTick = typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : ( typeof setImmediate === 'function' ? setImmediate : setTimeout );
const nextTick = typeof process === 'object' && typeof process.nextTick === 'function' ?
  process.nextTick :
  (function(global, nextTick, process, prefixes, i, fn) {
    // if( typeof global.process === 'object' && typeof global.process.nextTick === 'function' ) return global.process.nextTick;
    for( i = prefixes.length - 1; i >= 0 ; i-- ) {
      fn = global[prefixes[i++] + 'equestAnimationFrame'];
      if( fn instanceof Function ) return fn;
    }
    return global.setImmediate || global.setTimeout;
  })(typeof window === 'object' ? window : this, 'nextTick', 'process', 'oR msR mozR webkitR r'.split(' '), 0);


var PENDING = -1;
var FULFILLED = 0;
var REJECTED = 1;

function _runThen (p, then, fulfilled, value, resolve, reject) {
  var result;

  if( !( then instanceof Function ) ) return (fulfilled ? resolve : reject)(value);

  try{
    result = then(value);
    if( result === p ) throw new TypeError('A promise can not be resolved by itself');

    if( (typeof result === 'object' || result instanceof Function) && 'then' in result ) result.then.call(result, resolve, reject);
    else resolve(result);

  } catch (reason) {
    return reject( reason );
  }
}

function Parole (runContext) {
  if( !(this instanceof Parole) ) return new Parole(runContext);

  var p = this;
  var listeners = [];

  // p.status = PENDING;
  // p.value = null;
  p.listeners = listeners;

  var _runListeners = function () {
    for( var i = 0, n = listeners.length ; i < n ; i++ ) listeners[i]();
  };

  runContext.call(this, function (result) {
    if( p.status !== PENDING ) return;
    p.status = FULFILLED;
    p.value = result;
    nextTick(_runListeners);
  }, function (reason) {
    if( p.status !== PENDING ) return;
    p.status = REJECTED;
    p.value = reason;
    nextTick(_runListeners);
  });
}

Parole.prototype.status = PENDING;

Parole.prototype.then = function (onFulfilled, onRejected) {
  // // eslint-disable-next-line
  // console.log('Parole.prototype.then', this.status );
  var p = this;
  if( p.status === FULFILLED && !( onFulfilled instanceof Function ) ) return p;
  if( p.status === REJECTED && !( onRejected instanceof Function ) ) return p;

  return new Parole(function (resolve, reject) {
    var _p = this;
    // eslint-disable-next-line
    // console.log('Parole.prototype.then', _p );

    function complete () {
      var fulfilled = p.status === FULFILLED;
      _runThen(_p, fulfilled ? onFulfilled : onRejected, fulfilled, p.value, resolve, reject );
    }
    if( p.status !== PENDING ) nextTick(complete);
    else p.listeners.push(complete);
  });
};

Parole.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

Parole.resolve = function (value) {
  return new Parole(function (resolve) {
    resolve(value);
  });
};

Parole.reject = function (reason) {
  return new Parole(function (_resolve, reject) {
    reject(reason);
  });
};

Parole.defer = function () {
  var deferred = {};
  deferred.promise = new Parole(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

Parole.all = function (promises) {
  var waiting_promises = promises.length;
  return new Promise(function (resolve, reject) {
    var results = new Array(waiting_promises);
    promises.forEach(function (promise, i) {
      var addresult = function (result) {
        results[i] = result;
        waiting_promises--;
        if( !waiting_promises ) resolve(results);
      };
      if( (typeof promise === 'object' || promise instanceof Function) && 'then' in promise ) {
        promise.then.call(promise, addresult, reject);
      } else addresult(promise);
    });
  });
};

Parole.race = function (promises) {
  return new Parole(function (resolve, reject) {
    promises.forEach(function (promise) {
      if( (typeof promise === 'object' || promise instanceof Function) && 'then' in promise ) {
        promise.then.call(promise, resolve, reject);
      } else resolve(promise);
    });
  });
};

// Parole.resolve = function (value) {
//   return {
//     then: function (onFulfilled) {
//       if( !(onFulfilled instanceof Function) ) return Parole.resolve(value);
//       return new Parole(function (resolve, reject) {
//         var p = this;
//         nextTick(function () {
//           _runThen( p, onFulfilled, true, value, resolve, reject );
//         });
//       });
//     },
//     catch: function () {}
//   };
// };
//
// Parole.reject = function (reason) {
//   return {
//     then: function (_onFulfilled, onRejected) {
//       return this.catch(onRejected);
//     },
//     catch: function (onRejected) {
//       if( !(onRejected instanceof Function) ) return Parole.reject(reason);
//       return new Parole(function (resolve, reject) {
//         var p = this;
//         nextTick(function () {
//           _runThen( p, onRejected, false, reason, resolve, reject );
//         });
//       });
//     },
//   };
// };

module.exports = Parole;
