
var nextTick = typeof process === 'object' && typeof process.nextTick === 'function' ?
  process.nextTick :
  (function(global, nextTick, process, prefixes, i, fn) {
    for( i = prefixes.length - 1; i >= 0 ; i-- ) {
      fn = global[prefixes[i++] + 'equestAnimationFrame'];
      if( fn instanceof Function ) return fn;
    }
    return global.setImmediate || global.setTimeout;
  })(typeof window === 'object' ? window : this, 'nextTick', 'process', 'oR msR mozR webkitR r'.split(' '), 0);

var PENDING = -1;
var FULFILLED = 0;
var REJECTED = 1;

function isFunction (fn) {
  return typeof fn === 'function';
}

function isThenable (x) {
  return ( typeof x === 'object' || isFunction(x) ) && 'then' in x;
}

function _runThen (p, then, is_fulfilled, value, resolve, reject) {
  var result;

  if( !isFunction(then) ) return (is_fulfilled ? resolve : reject)(value);

  try {
    result = then(value);
    if( result === p ) throw new TypeError('A promise can not be resolved by itself');

    if( isThenable(result) ) result.then.call(result, resolve, reject);
    else resolve(result);

  } catch (reason) {
    return reject( reason );
  }
}

function Parole (runContext) {
  if( !(this instanceof Parole) ) return new Parole(runContext);

  var p = this;
  var listeners = [];

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
  var p = this;
  if( p.status === FULFILLED && !isFunction(onFulfilled) ) return p;
  if( p.status === REJECTED && !isFunction(onRejected) ) return p;

  return new Parole(function (resolve, reject) {
    var _p = this;

    function complete () {
      var is_fulfilled = p.status === FULFILLED;
      _runThen(_p, is_fulfilled ? onFulfilled : onRejected, is_fulfilled, p.value, resolve, reject );
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

module.exports = Parole;
