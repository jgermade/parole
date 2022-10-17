
var nextTick = typeof window !== 'object' ? (
  typeof process === 'object' && process !== null && typeof process.nextTick === 'function' && process.nextTick || typeof global === 'object' && global !== null && (
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
  for (var i = raf_prefixes.length - 1; i >= 0; i--) {
    if (window[raf_prefixes[i] + 'equestAnimationFrame']) return window[raf_prefixes[i] + 'equestAnimationFrame'].bind(window)
  }

  if ('MutationObserver' in window) {
    return (function (node) {
      return function (callback) {
        var observer = new MutationObserver(function () {
          callback()
          observer.disconnect()
        })
        observer.observe(node, { characterData: true })
        node.data = false
      }
    })(document.createTextNode(''))
  }

  return window.setImmediate || window.setTimeout
})(window, 'oR msR mozR webkitR r'.split(' '))

function _resolvePromise (promise, x, fulfill, reject) {
  var _then
  try {
    if (x === promise) throw new TypeError('A promise can not be resolved by itself')

    if (x && (typeof x === 'object' || typeof x === 'function')) {
      _then = x.then

      if (_then instanceof Function) {
        _then.call(x, function onFulfilled (y) {
          _resolvePromise(promise, y, fulfill, reject)
        }, function onRejected (reason) {
          reject(reason)
        })
      } else { fulfill(x) }
    } else {
      fulfill(x)
    }
  } catch (reason) {
    reject(reason)
  }
}

function resolvedFuture (result) {
  return future(function (resolve) {
    resolve(result)
  })
}

function rejectedFuture (result) {
  return future(function (_resolve, reject) {
    reject(result)
  })
}

var onUncaught = null
future.onUncaught = function (_onUncaught) {
  onUncaught = _onUncaught
}

function _runQueue (queue, result, is_uncaught) {
  return function () {
    for (var i = 0, n = queue.length; i < n; i++) queue[i](result)
    queue.splice()
    if (is_uncaught) onUncaught(result)
  }
}

// function _resolveThen (_promise, then, _result, _resolve, _reject ) {
//   return function () {
//     try {
//       _resolvePromise(_promise, then(_result), _resolve, _reject );
//     } catch(_reason) {
//       _reject(_reason);
//     }
//   };
// }

function future (run) {
  var result
  var resolve_listeners = []
  var reject_listeners = []
  var is_resolving = false
  var is_fullfilled = false
  var is_rejected = false
  var is_uncaught = true

  var promise = {
    then: function (onFulfilled, onRejected) {
      if (onRejected instanceof Function) is_uncaught = false

      if (is_fullfilled && typeof onFulfilled !== 'function') return resolvedFuture(result)

      if (is_rejected && typeof onRejected !== 'function') return rejectedFuture(result)

      var _promise = future(function (_resolve, _reject) {
        var _onFulfilled = onFulfilled instanceof Function ? function (_result) {
          // nextTick( _resolveThen(_promise, onFulfilled, _result, _resolve, _reject) );

          nextTick(function () {
            try {
              _resolvePromise(_promise, onFulfilled(_result), _resolve, _reject)
            } catch (_reason) {
              _reject(_reason)
            }

            // _resolvePromise(_promise, { then: function (_complete) {
            //   if( is_completed ) return;
            //   is_completed = true;
            //   // var value = onFulfilled(_result);
            //   // if( value === promise ) console.log('TypeError promise'); // eslint-disable-line
            //   // if( value === _promise ) console.log('TypeError _promise'); // eslint-disable-line
            //   _complete( onFulfilled(_result) );
            // } }, _resolve, _reject );
          })
        } : _resolve

        var _onRejected = onRejected instanceof Function ? function (_result) {
          // nextTick( _resolveThen(_promise, onRejected, _result, _resolve, _reject) );

          nextTick(function () {
            try {
              _resolvePromise(_promise, onRejected(_result), _resolve, _reject)
            } catch (_reason) {
              _reject(_reason)
            }
            // _resolvePromise(_promise, { then: function (_complete) {
            //   if( is_completed ) return;
            //   is_completed = true;
            //   _complete( onRejected(_result) );
            // } }, _resolve, _reject );
          })
        } : _reject

        if (is_fullfilled) _onFulfilled(result)
        else if (is_rejected) _onRejected(result)
        else {
          resolve_listeners.push(_onFulfilled)
          reject_listeners.push(_onRejected)
        }
      })

      return _promise
    },
    catch: function (onReject) {
      return promise.then(null, onReject)
    },
  }

  var resolve = function (value) {
    if (is_resolving) return

    is_resolving = true
    _resolvePromise(promise, value, function (_result) {
      is_fullfilled = true
      result = _result

      nextTick(_runQueue(resolve_listeners, result))
      reject_listeners.splice()
    }, reject)
  }

  var reject = function (reason) {
    if (is_resolving || is_fullfilled || is_rejected) return

    is_resolving = true
    is_rejected = true
    result = reason

    nextTick(_runQueue(reject_listeners, result, is_uncaught))
    resolve_listeners.splice()
  }

  try {
    // run.call(promise, resolve, reject);
    run(resolve, reject)
  } catch (_reason) {
    reject(_reason)
  }

  return promise
}

future.resolve = resolvedFuture
future.reject = rejectedFuture

future.defer = function () {
  var deferred = {}
  deferred.promise = future(function (resolve, reject) {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
}

future.onUncaught(function (reason) {
  if( reason instanceof Error ) console.error('Uncaught (in promise) ' + reason.toString() + '\nstack: ' + reason.stack ); // eslint-disable-line

})

module.exports = future
