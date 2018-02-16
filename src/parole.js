
module.exports = Parole;

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

function Parole (execute) {
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

  this.then = function (onFulfilled, onRejected) {
    return new Parole(function (resolve, reject) {
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
  };
  this.catch = function (onRejected) {
    return this.then(null, onRejected);
  };
}

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
