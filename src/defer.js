
module.exports = defer;

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

// const runImmediatelly = typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : ( typeof setImmediate === 'function' ? setImmediate : setTimeout );

const PENDING = -1;
const FULFILLED = 0;
const REJECTED = 1;

function _runThen (p, then, fulfilled, value, resolve, reject) {
  var result;
  if( !( then instanceof Function ) ) {
    (fulfilled ? resolve : reject)(value);
    return;
  }
  try{
    result = then(value);
    if( result === p ) throw new TypeError('A promise can not be resolved by itself');
    if( result && result.then ) result.then.call(result, resolve, reject);
    else resolve(result);
  } catch(reason) {
    reject(reason);
  }
}

function defer (execute) {
  var status = PENDING,
      value = null,
      listeners = [],
      _runListeners = function () {
        for( var i = 0, n = listeners.length ; i < n ; i++ ) listeners[i]();
      };

  execute(function (result) {
    if( status !== PENDING ) return;
    status = FULFILLED;
    value = result;
    nextTick(_runListeners);
  }, function (reason) {
    if( status !== PENDING ) return;
    status = REJECTED;
    value = reason;
    nextTick(_runListeners);
  });

  return {
    then: function (onFulfilled, onRejected) {
      var p = this;
      return defer(function (resolve, reject) {

        function complete () {
          var fulfilled = status === FULFILLED;
          _runThen(p,  fulfilled ? onFulfilled : onRejected, fulfilled, value, resolve, reject );
        }
        if( status !== PENDING ) nextTick(complete);
        else listeners.push(complete);
      });
    },
    catch: function (onRejected) {
      return this.then(null, onRejected);
    }
  };
}

defer.resolve = function (value) {
  return defer(function (resolve) {
    resolve(value);
  });
};

defer.reject = function (reason) {
  return defer(function (_resolve, reject) {
    reject(reason);
  });
};

// defer.resolve = function (value) {
//   return {
//     then: function (onFulfilled) {
//       var p = this;
//       if( !(onFulfilled instanceof Function) ) return defer.resolve(value);
//       return defer(function (resolve, reject) {
//         nextTick(function () {
//           _runThen( p, onFulfilled, true, value, resolve, reject );
//         });
//       });
//     },
//     catch: function () {}
//   };
// };
//
// defer.reject = function (reason) {
//   return {
//     then: function (_onFulfilled, onRejected) {
//       return this.catch(onRejected);
//     },
//     catch: function (onRejected) {
//       var p = this;
//       if( !(onRejected instanceof Function) ) return defer.reject(reason);
//       return defer(function (resolve, reject) {
//         nextTick(function () {
//           _runThen( p, onRejected, false, reason, resolve, reject );
//         });
//       });
//     },
//   };
// };
