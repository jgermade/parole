
module.exports = Parole;

const PENDING = -1;
const FULFILLED = 0;
const REJECTED = 1;

function isFunction (fn) {
  return fn instanceof Function;
}

function runListener ( listener, status, value, callback ) {
  // console.log('runListener', listener.toString() );
  var result;
  try {
    status = FULFILLED;
    result = listener(value);
    if( result && result.then instanceof Function ) runListener(result.then, FULFILLED, value, callback);
    else callback(FULFILLED, result);
  } catch (reason) {
    callback(REJECTED, reason);
  }
}

function resolveListeners (listeners, _status, _value) {
  var i = 0, n = listeners.length,
      recursiveRunListener = function (status, value) {
        // console.log('recursiveRunListener', status, value, listeners.length );
        if( i >= n ) {
          // if( status === REJECTED && value instanceof Error ) throw value;
          return;
        }
        if( isFunction(listeners[i][status]) ) runListener(listeners[i++][status], status, value, recursiveRunListener);
        else {
          i++;
          recursiveRunListener(status, value);
        }
      };

  recursiveRunListener(_status, _value);
}

function onDone (resolve, reject) {
  return function (_status, _value) {
    if( _status === FULFILLED ) resolve(_value);
    else reject(_value);
  };
}

function Parole (runner) {
  if( !(this instanceof Parole) ) return new Parole(runner);

  var promise = this,
      status = PENDING,
      value = null,
      listeners = [];

  promise.then = function (onFulfilled, onRejected) {
    return new Promise(function (resolve, reject) {

      if( status === PENDING ) {
        listeners.push([
          onFulfilled instanceof Function ? function (_value) {
            runListener( onFulfilled, FULFILLED, _value, onDone(resolve, reject) );
          } : null,
          onRejected instanceof Function ? function (_reason) {
            runListener( onRejected, REJECTED, _reason, onDone(resolve, reject) );
          } : null
        ]);
      } else {
        // setTimeout(function () {
          if( status === FULFILLED ) {
            if( onFulfilled instanceof Function ) runListener( onFulfilled, status, value, onDone(resolve, reject) );
            else resolve(value);
          } else {
            if( onRejected instanceof Function ) runListener( onRejected, status, value, onDone(resolve, reject) );
            else reject(value);
          }
        // });
      }
      // if( status === FULFILLED ) onFulfilled(value);
      // else onRejected(value);
    });

    // if( status === PENDING ) listeners.push([onFulfilled, onRejected]);
    // else {
    //   return new Promise(function (resolve, reject) {
    //     runListener( status === FULFILLED ? onFulfilled : onRejected, status, value, function (_status, _value) {
    //       if( _status === FULFILLED ) resolve(_value);
    //       else reject(_value);
    //     });
    //     // if( status === FULFILLED ) onFulfilled(value);
    //     // else onRejected(value);
    //   });
    //
    //   // var fn = status === FULFILLED ? onFulfilled : onRejected;
    //   // if( !isFunction(fn) ) return promise;
    //   // var tm = setTimeout(function () {
    //   //   clearTimeout(tm);
    //   //   fn(value);
    //   // });
    // }
    // return promise;
  };

  promise.catch = function (onRejected) {
    return promise.then(null, onRejected);
  };

  runner(function (result) {
    if( status !== PENDING ) return;
    status = FULFILLED;
    value = result;
    var tm = setTimeout(function () {
      clearTimeout(tm);
      resolveListeners(listeners, status, value);
    });
  }, function (reason) {
    if( status !== PENDING ) return;
    status = REJECTED;
    value = reason;
    var tm = setTimeout(function () {
      clearTimeout(tm);
      resolveListeners(listeners, status, value);
    });
  });

}

Parole.defer = function () {
  var deferred = {};
  deferred.promise = new Parole(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

Parole.resolve = function (value) {
  return new Parole(function (resolve) { resolve(value); });
};

Parole.reject = function (value) {
  return new Parole(function (_resolve, reject) { reject(value); });
};
