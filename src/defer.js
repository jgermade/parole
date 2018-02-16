
module.exports = defer;

const PENDING = -1;
const FULFILLED = 0;
const REJECTED = 1;

function _runThen (then, fulfilled, value, resolve, reject) {
  var result;
  if( !( then instanceof Function ) ) {
    (fulfilled ? resolve : reject)(value);
    return;
  }
  try{
    result = then(value);
    if( result && result.then ) _runThen(result.then, true, value, resolve, reject);
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
    setTimeout(_runListeners);
  }, function (reason) {
    if( status !== PENDING ) return;
    status = REJECTED;
    value = reason;
    setTimeout(_runListeners);
  });

  return {
    then: function (onFulfilled, onRejected) {
      return defer(function (resolve, reject) {
        var fulfilled;
        if( status !== PENDING ) {
          fulfilled = status === FULFILLED;
          setTimeout(function () {
            _runThen( fulfilled ? onFulfilled : onRejected, fulfilled, value, resolve, reject );
          });
        } else listeners.push(function () {
          var fulfilled = status === FULFILLED;
          _runThen( fulfilled ? onFulfilled : onRejected, fulfilled, value, resolve, reject );
        });
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
//       if( !(onFulfilled instanceof Function) ) return defer.resolve(value);
//       return defer(function (resolve, reject) {
//         setTimeout(function () {
//           _runThen( onFulfilled, true, value, resolve, reject );
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
//       if( !(onRejected instanceof Function) ) return defer.reject(reason);
//       return defer(function (resolve, reject) {
//         setTimeout(function () {
//           _runThen( onRejected, false, reason, resolve, reject );
//         });
//       });
//     },
//   };
// };
