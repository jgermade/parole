
function stepResult (step, value, type) {
  if( value && value.then ) {
    value.then(function (result) {
      step.deferred.resolve(result);
    }, function (reason) {
      step.deferred.reject(reason);
    });
  } else {
    step.deferred[type](value);
  }
}

function processQueue(queue, err, result) {
  var len = queue.length,
      step = queue.shift(),
      type = err ? 'reject' : 'resolve';

  while( step ) {

    if( step[type] ) {

      if( err ) {
        queue.$$uncough = false;
      }

      try {
        stepResult(step, step[type](result), 'resolve');
      } catch (reason) {
        stepResult(step, reason, 'reject');
      }

    } else {
      stepResult(step, result, type);
    }

    step = queue.shift();
  }

  if( err && queue.$$uncough === undefined ) {
    var uncoughSerial = setTimeout(function () {
      if( queue.$$uncough === uncoughSerial ) {
        throw new Error('Uncaught (in promise)');
      }
    }, 0);
    queue.$$uncough = uncoughSerial;
  }
}

function Promise (executor) {
  if( !( executor instanceof Function ) ) {
    throw new TypeError('Promise resolver undefined is not a function');
  }

  var p = this;
  this.$$queue = [];

  executor(function (result) {
    p.$$fulfilled = true;
    p.$$value = result;
    processQueue(p.$$queue, false, result);
  }, function (reason) {
    p.$$fulfilled = false;
    p.$$value = reason;
    processQueue(p.$$queue, true, reason);
  });
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  var _this = this,
      _promise = new Promise(function (resolve, reject) {
        _this.$$queue.push({ resolve: onFulfilled, reject: onRejected, deferred: { resolve: resolve, reject: reject } });
      });

  if( this.$$fulfilled !== undefined ) {
    processQueue(_this.$$queue, !this.$$fulfilled, this.$$value);
  }

  return _promise;
};

Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected);
};

Promise.all = function (iterable) {
  return new Promise(function (resolve, reject) {
    var pending = iterable.length,
        results = [];
    iterable.forEach(function (_promise, i) {

      ( _promise.then ? _promise : Promise.resolve(_promise) ).then(function (result) {
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

Promise.race = function (iterable) {
  return new Promise(function (resolve, reject) {
    var done = false;

    iterable.forEach(function (_promise, i) {
      if( done ) {
        return;
      }
      ( _promise.then ? _promise : Promise.resolve(_promise) ).then(function (result) {
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

Promise.resolve = function (result) {
  return new Promise(function (resolve, reject) { resolve(result); });
};

Promise.reject = function (reason) {
  return new Promise(function (resolve, reject) { reject(reason); });
};

module.exports = Promise;
