
module.exports = Parole;

const runImmediatelly = typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : ( typeof setImmediate === 'function' ? setImmediate : setTimeout );

const PENDING = -1;
const FULFILLED = 0;
const REJECTED = 1;

function _runThen (then, fulfilled, value, resolve, reject) {
  var result;
  // if( value === this ) return reject(new TypeError('A promise can not be resolved by itself'));
  if( !( then instanceof Function ) ) {
    (fulfilled ? resolve : reject)(value);
    return;
  }
  try{
    // if( value === this ) throw new TypeError('A promise can not be resolved by itself');
    result = then(value);
    // if( result === this ) throw new TypeError('A promise can not be resolved by itself');
    if( result && result.then ) _runThen.call(this, result.then, true, value, resolve, reject);
    else resolve(result);
  } catch (reason) {
    // if( result === this )
    // reject( result === this ? new TypeError('A promise can not be resolved by itself') : reason );
    reject( reason );
  }
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

function Parole (execute) {
  var p = this;

  p.status = PENDING;
  p.value = null;
  p.listeners = [];

  var _runListeners = function () {
    for( var i = 0, n = p.listeners.length ; i < n ; i++ ) p.listeners[i]();
  };

  execute(function (result) {
    if( p.status !== PENDING ) return;
    // _setPromiseValue(p, FULFILLED, result);
    p.status = FULFILLED;
    p.value = result;
    runImmediatelly(_runListeners);
  }, function (reason) {
    if( p.status !== PENDING ) return;
    // _setPromiseValue(p, REJECTED, reason);
    p.status = REJECTED;
    p.value = reason;
    runImmediatelly(_runListeners);
  });

  // this.then = function (onFulfilled, onRejected) {
  //   return new Parole(function (resolve, reject) {
  //     function complete () {
  //       var fulfilled = status === FULFILLED;
  //       _runThen.call(p, fulfilled ? onFulfilled : onRejected, fulfilled, value, resolve, reject );
  //     }
  //     if( status !== PENDING ) setTimeout(complete);
  //     else listeners.push(complete);
  //   });
  // };
  // this.catch = function (onRejected) {
  //   return this.then(null, onRejected);
  // };
}

Parole.prototype.then = function (onFulfilled, onRejected) {
  var p = this;
  return new Parole(function (resolve, reject) {
    function complete () {
      var fulfilled = p.status === FULFILLED;
      _runThen.call(p, fulfilled ? onFulfilled : onRejected, fulfilled, p.value, resolve, reject );
    }
    if( p.status !== PENDING ) runImmediatelly(complete);
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
