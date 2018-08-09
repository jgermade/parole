
var nextTick = typeof window !== 'object' ? (
      typeof process === 'object' && typeof process.nextTick === 'function' && process.nextTick || typeof global === 'object' && (
        global.setInmediate || global.setTimeout
      )
    ) : (function (window, raf_prefixes) {
      // if( 'Promise' in global && typeof global.Promise.resolve === 'function' ) return (function (resolved) {
      //   return resolved.then.bind(resolved);
      // })( global.Promise.resolve() );
      //
      // Remove due to issues with touchmove:
      //
      // https://stackoverflow.com/questions/32446715/why-is-settimeout-game-loop-experiencing-lag-when-touchstart-event-fires/35668492
      // https://bugs.chromium.org/p/chromium/issues/detail?id=567800

      // from: https://github.com/wesleytodd/browser-next-tick
      for( var i = raf_prefixes.length - 1 ; i >= 0 ; i-- ) {
        if( window[raf_prefixes[i] + 'equestAnimationFrame'] ) return window[raf_prefixes[i] + 'equestAnimationFrame'].bind(window);
      }

      if( 'MutationObserver' in window ) return (function (node) {
        return function (callback) {
          var observer = new MutationObserver(function () {
            callback();
            observer.disconnect();
          });
          observer.observe( node, {characterData: true} );
          node.data = false;
        };
      })( document.createTextNode('') );

      return window.setImmediate || window.setTimeout;

    })( window, 'oR msR mozR webkitR r'.split(' ') );

function _runQueue (queue, result) {
  return function () {
    for( var i = 0, n = queue.length; i < n ; i++ ) queue[i](result);
    // queue.splice();
  };
}

function _resolvePromise (promise, result, fulfill, reject) {
  var _then;
  try {

    if( result === promise ) throw new TypeError('A promise can not be resolved by itself');

    if( (typeof result === 'object' && result !== null) || typeof result === 'function' ) {
      _then = result.then;

      if( _then instanceof Function )
        _then.call(result, function (_result) {
          _resolvePromise(promise, _result, fulfill, reject);
        }, reject);

      else
        fulfill(result);

    } else {
      fulfill(result);
    }

  } catch(reason) {
    reject(reason);
  }
}

function resolvedFuture (result) {
  return future(function (resolve) {
    resolve(result);
  });
}

function rejectedFuture (result) {
  return future(function (_resolve, reject) {
    reject(result);
  });
}

function future (run) {

  var result,
      resolve_listeners = [],
      reject_listeners = [],
      is_resolving = false,
      is_fullfilled = false,
      is_rejected = false;

  var promise = {
    then: function (onFulfilled, onRejected) {

      if( is_fullfilled && typeof onFulfilled !== 'function' ) return resolvedFuture(result);

      if( is_rejected && typeof onRejected !== 'function' ) return rejectedFuture(result);

      var _promise = future(function (_resolve, _reject) {

        var _onFulfilled = onFulfilled instanceof Function ? function (_result) {

            nextTick(function () {
              _resolvePromise(_promise, { then: function (_complete) {
                // var value = onFulfilled(_result);
                // if( value === promise ) console.log('TypeError promise'); // eslint-disable-line
                // if( value === _promise ) console.log('TypeError _promise'); // eslint-disable-line
                return _complete( onFulfilled(_result) );
              } }, _resolve, _reject );
            });

          } : _resolve;

        var _onRejected = onRejected instanceof Function ? function (_result) {

            nextTick(function () {
              _resolvePromise(_promise, { then: function (_complete) {
                return _complete( onRejected(_result) );
              } }, _resolve, _reject );
            });

          } : _reject;

        if( is_fullfilled ) _onFulfilled(result);
        else if( is_rejected ) _onRejected(result);
        else {
          resolve_listeners.push(_onFulfilled);
          reject_listeners.push(_onRejected);
        }

      });

      return _promise;
    },
    catch: function (onReject) {
      return promise.then(null, onReject);
    },
  };

  var resolve = function (value) {
    if( is_resolving ) return;

    is_resolving = true;
    _resolvePromise(promise, value, function (_result) {

      is_fullfilled = true;
      result = _result;

      nextTick( _runQueue( resolve_listeners, result ) );
    }, function (reason) {
      is_rejected = true;
      result = reason;

      nextTick( _runQueue( reject_listeners, result ) );
    });
  };

  var reject = function (reason) {
    if( is_resolving || is_fullfilled || is_rejected ) return;

    is_resolving = true;
    is_rejected = true;
    result = reason;

    nextTick( _runQueue( reject_listeners, result ) );
  };

  try{
    run.call(promise, resolve, reject);
  } catch(_reason) {
    reject(_reason);
  }

  return promise;

}

future.resolve = resolvedFuture;
future.reject = rejectedFuture;

future.defer = function () {
  var deferred = {};
  deferred.promise = future(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

module.exports = future;