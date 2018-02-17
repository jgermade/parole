
var runImmediatelly = typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : ( typeof setImmediate === 'function' ? setImmediate : setTimeout );
// const runImmediatelly = setTimeout;

// function runImmediatelly (fn) {
//   return _runImmediatelly(fn);
// }

var PENDING = -1;
var FULFILLED = 0;
var REJECTED = 1;

function _runThen (p, then, fulfilled, value, resolve, reject) {
  var result;

  // if( p.status === PENDING ) throw new Error('promise PENDING');
  // console.log('_runThen', typeof p, typeof value);
  // if( value === p ) return reject(new TypeError('A promise can not be resolved by itself'));

  if( !( then instanceof Function ) ) {
    return (fulfilled ? resolve : reject)(value);
  }
  try{
    // if( value === p ) throw new TypeError('A promise can not be resolved by itself');
    result = then(value);
    if( result === p ) throw new TypeError('A promise can not be resolved by itself');
    // if( result && result.then instanceof Function ) _runThen(result, result.then, true, value, resolve, reject);
    if( (typeof result === 'object' || result instanceof Function) && 'then' in result ) result.then(resolve, reject);
    else resolve(result);
    // resolve(result);
  } catch (reason) {
    return reject( reason );
    // if( reason && reason.then instanceof Function ) reason.then(resolve, reject);
    // else reject( reason );
    // if( reason && reason.then instanceof Function ) _runThen(reason, reason.then, false, value, resolve, reject);
    // else reject( reason );

    // if( result === this )
    // reject( result === p ? new TypeError('A promise can not be resolved by itself') : reason );

  }

  // var _then = result && result.then;
  //
  // if( _then ) {
  //   try {
  //     _then(resolve, reject);
  //   } catch(_err) {
  //     reject(_err);
  //   }
  // } else resolve(result);

  // var _then = result && result.then;
  //
  // if( _then instanceof Function ) {
  //   try {
  //     _then(resolve, reject);
  //   } catch(_err) {
  //     reject(_err);
  //   }
  // } else resolve(result);

  // if( result && 'then' in result ) {
  //   try {
  //     result.then(resolve, reject);
  //   } catch(_err) {
  //     reject(_err);
  //   }
  // } else resolve(result);
  // if( result && result.then instanceof Function ) result.then(resolve, reject);
  // else resolve(result);
}

// function _setPromiseValue (p, status, value) {
//   // if( value === p || value.promise === p ) {
//   if( value === p ) {
//     // eslint-disable-next-line
//     console.log('A promise can not be resolved by itself');
//     status = REJECTED;
//     value = new TypeError('A promise can not be resolved by itself');
//   }
//   Object.defineProperty(p, 'status', {
//     enumerable: false,
//     writable: false,
//     value: status
//   });
//   Object.defineProperty(p, 'value', {
//     enumerable: false,
//     writable: false,
//     value: value
//   });
// }

// var _runListeners = function (listeners) {
//   for( var i = 0, n = listeners.length ; i < n ; i++ ) listeners[i]();
// };

function Parole (runContext) {
  if( !(this instanceof Parole) ) return new Parole(runContext);

  // eslint-disable-next-line
  // console.log('Parole', this);
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
    // // _setPromiseValue(p, FULFILLED, result);
    p.status = FULFILLED;
    p.value = result;
    runImmediatelly(_runListeners);
  }, function (reason) {
    if( p.status !== PENDING ) return;
    // // _setPromiseValue(p, REJECTED, reason);
    p.status = REJECTED;
    p.value = reason;
    runImmediatelly(_runListeners);
  });

  // p.then = function (onFulfilled, onRejected) {
  //   return new Parole(function (resolve, reject) {
  //     var _p = this;
  //     function complete () {
  //       var fulfilled = (p.status === FULFILLED);
  //       _runThen(_p, fulfilled ? onFulfilled : onRejected, fulfilled, p.value, resolve, reject );
  //     }
  //     if( p.status !== PENDING ) runImmediatelly(complete);
  //     else listeners.push(complete);
  //   });
  // };
}

Parole.prototype.status = PENDING;
// Object.defineProperty(Parole.prototype, 'status', {
//   enumerable: false,
//   configurable: false,
//   writable: false,
//   value: PENDING
// });

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
      var result,
          fulfilled = p.status === FULFILLED,
          then = fulfilled ? onFulfilled : onRejected;

      // if( p.status === PENDING ) throw new Error('promise PENDING');
      // console.log('_runThen', typeof p, typeof value);
      // if( value === p ) return reject(new TypeError('A promise can not be resolved by itself'));

      if( !( then instanceof Function ) ) {
        return (fulfilled ? resolve : reject)(p.value);
      }
      try{
        // if( value === p ) throw new TypeError('A promise can not be resolved by itself');
        result = then(p.value);
        if( result === _p ) throw new TypeError('A promise can not be resolved by itself');
        // if( result && result.then instanceof Function ) _runThen(result, result.then, true, value, resolve, reject);
        if( (typeof result === 'object' || result instanceof Function) && 'then' in result ) result.then(resolve, reject);
        else resolve(result);
        // resolve(result);
      } catch (reason) {
        return reject( reason );
        // if( reason && reason.then instanceof Function ) reason.then(resolve, reject);
        // else reject( reason );
        // if( reason && reason.then instanceof Function ) _runThen(reason, reason.then, false, value, resolve, reject);
        // else reject( reason );

        // if( result === this )
        // reject( result === p ? new TypeError('A promise can not be resolved by itself') : reason );

      }

      // var fulfilled = p.status === FULFILLED;
      // // console.log('Parole.prototype.then', _p.value );
      // // if( p.status === PENDING ) {
      // //   throw new Error(p);
      // //   process.exit(1);
      // // }
      // _runThen(_p, fulfilled ? onFulfilled : onRejected, fulfilled, p.value, resolve, reject );
    }
    if( p.status !== PENDING ) runImmediatelly(complete);
    else p.listeners.push(complete);
    // else p.listeners.push(complete);
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

// Parole.resolve = function (value) {
//   return {
//     then: function (onFulfilled) {
//       if( !(onFulfilled instanceof Function) ) return Parole.resolve(value);
//       return new Parole(function (resolve, reject) {
//         var p = this;
//         runImmediatelly(function () {
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
//         runImmediatelly(function () {
//           _runThen( p, onRejected, false, reason, resolve, reject );
//         });
//       });
//     },
//   };
// };

Parole.defer = function () {
  var deferred = {};
  deferred.promise = new Parole(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

module.exports = Parole;
