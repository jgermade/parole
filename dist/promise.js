(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['$q'], function () {
        return require('./q');
    });
} else {
    // Browser globals
    global.$q = require('./q');
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./q":3}],2:[function(require,module,exports){

function stepResult(step, value, type) {
  if (value && value.then) {
    value.then(function (result) {
      step.deferred.resolve(result);
    }, function (reason) {
      step.deferred.reject(reason);
    });
  } else {
    step.deferred[type](value);
  }
}

function processQueue(promise) {
  if (promise.$$succeeded === undefined) {
    return;
  }

  var len = promise.$$queue.length,
      step = promise.$$queue.shift(),
      type = promise.$$succeeded ? 'resolve' : 'reject',
      uncough = !promise.$$succeeded && promise.$$uncought++;

  while (step) {

    if (step[type]) {
      uncough = false;

      try {
        stepResult(step, step[type](promise.$$value), 'resolve');
      } catch (reason) {
        stepResult(step, reason, 'reject');
      }
    } else {
      stepResult(step, promise.$$value, type);
    }

    step = promise.$$queue.shift();
  }

  if (!promise.$$succeeded && uncough) {
    // setTimeout(function () {
    if (promise.$$uncough === uncough) {
      throw new Error('Uncaught (in promise)');
    }
    // }, 0);
  }
}

function Promise(executor) {
  if (!(executor instanceof Function)) {
    throw new TypeError('Promise resolver undefined is not a function');
  }

  var p = this;
  this.$$queue = [];
  this.$$uncough = 0;

  try {
    executor(function (result) {
      p.$$succeeded = true;
      p.$$value = result;
      processQueue(p);
    }, function (reason) {
      p.$$succeeded = false;
      p.$$value = reason;
      processQueue(p);
    });
  } catch (err) {
    p.$$succeeded = false;
    p.$$value = err;
    processQueue(p);
  }
}

Promise.prototype.then = function (onsucceeded, onRejected) {
  var _this = this,
      _promise = new Promise(function (resolve, reject) {
    _this.$$queue.push({ resolve: onsucceeded, reject: onRejected, deferred: { resolve: resolve, reject: reject } });
  });

  processQueue(this);

  return _promise;
};

Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected);
};

Promise.defer = function () {
  var deferred = {};
  deferred.promise = new Promise(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

Promise.all = function (iterable) {
  return new Promise(function (resolve, reject) {
    var pending = iterable.length,
        results = [];
    iterable.forEach(function (_promise, i) {

      (_promise.then ? _promise : Promise.resolve(_promise)).then(function (result) {
        results[i] = result;
        if (--pending === 0) {
          resolve(results);
        }
      }, function (reason) {
        if (pending !== -1) {
          pending === -1;
          reject(reason);
        }
      });
    });
  });
};

Promise.race = function (iterable) {
  return new Promise(function (resolve, reject) {
    var done = false;

    iterable.forEach(function (_promise, i) {
      if (done) {
        return;
      }
      (_promise.then ? _promise : Promise.resolve(_promise)).then(function (result) {
        if (!done) {
          done = true;
          resolve(result);
        }
      }, function (reason) {
        if (!done) {
          done = true;
          reject(reason);
        }
      });
    });
  });
};

Promise.resolve = function (result) {
  return new Promise(function (resolve, reject) {
    resolve(result);
  });
};

Promise.reject = function (reason) {
  return new Promise(function (resolve, reject) {
    reject(reason);
  });
};

module.exports = Promise;

},{}],3:[function(require,module,exports){
(function (global){

module.exports = require('./qizer')(global.Promise || require('./promise-polyfill'));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./promise-polyfill":2,"./qizer":4}],4:[function(require,module,exports){

module.exports = function (Promise) {

  function q(executor) {
    return new Promise(executor);
  }

  ['defer', 'resolve', 'reject', 'all', 'race'].forEach(function (fName) {
    q[fName] = Promise[fName];
  });

  q.when = function (p) {
    return p && p.then ? p : Promise.resolve(p);
  };
  q.usePolyfill = function () {
    Promise = require('./promise-polyfill');
  };

  return q;
};

},{"./promise-polyfill":2}]},{},[1]);
