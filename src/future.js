
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

// const PENDING = 0;
// const FULFILLED = 1;
// const REJECTED = -1;

function runQueue (queue, result) {
	return function () {
		for( var i = 0, n = queue.length; i < n ; i++ ) queue[i](result);
		// queue.splice();
	};
}

// function _nextTick (fn) {
// 	return function () {
// 		nextTick(fn);
// 	};
// }

function _followThen (promise, result, resolve, reject) {
	var _then;
	if( result === promise ) reject( new TypeError('A promise can not be resolved by itself') );
	else if( ( typeof result === 'object' || typeof result === 'function' ) && 'then' in result ) {
		try {
			// if( result === promise ) throw new TypeError('A promise can not be resolved by itself');
			_then = result.then;
		} catch(_reason) {
			return reject(_reason);
		}
		if( _then instanceof Function ) _then.call(result, function (_result) {
			_followThen(result, _result, resolve, reject);
		}, reject);
		else resolve(result);

	} else resolve(result);
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

function future (resolver) {

	// if( typeof resolver !== 'function' ) throw new Error('future needs a resolver');

	var result,
			// status = PENDING,
			resolve_listeners = [],
			reject_listeners = [],
			is_fulfilling = false,
			is_fullfilled = false,
			is_rejected = false;

	var resolve = function (value) {
		if( is_fulfilling || is_fullfilled || is_rejected ) return;

		// if( value === promise ) throw new TypeError('A promise can not be resolved by itself');
		// if( value === promise ) {
		// 	reject( new TypeError('A promise can not be resolved by itself') );
		// 	return;
		// }

		is_fulfilling = true;
		_followThen(promise, value, function (_result) {

			// if( _result === promise ) throw new TypeError('A promise can not be resolved by itself');
			// if( _result === promise ) return reject( new TypeError('A promise can not be resolved by itself') );

			is_fullfilled = true;
			result = _result;

			nextTick( runQueue( resolve_listeners, result ) );
		}, reject);
	};

	var reject = function (reason) {
		// if( reason === promise ) throw new TypeError('A promise can not be resolved by itself');

		if( is_fulfilling || is_fullfilled || is_rejected ) return;

		// if( reason === promise ) throw new TypeError('A promise can not be resolved by itself');

		is_rejected = true;
		result = reason;

		// if( !reject_listeners.length && reason instanceof Error ) throw new TypeError('Uncought promise');

		nextTick( runQueue( reject_listeners, result ) );
	};

	var promise = {
		then: function (onFulfil, onReject) {

			// return future(function (resolve, reject) {
			// 	var _onFulfil = onFulfil instanceof Function ? function (_result) {
			// 		nextTick(function () {
			// 			var _result;
			// 			try{
			// 				_result = onFulfil(result);
			// 			} catch(_reason) {
			// 				reject(_reason);
			// 			}

			// 			resolve(_result);
			// 		});
			// 	} : function (_result) {
			// 		resolve(_result);
			// 	};

			// 	var _onReject = onReject instanceof Function ? function (_result) {
			// 		nextTick(function () {
			// 			var _result;
			// 			try{
			// 				_result = onReject(result);
			// 			} catch(_reason) {
			// 				reject(_reason);
			// 			}

			// 			resolve(_result);
			// 		});
			// 	} : function (_result) {
			// 		resolve(_result);
			// 	};

			// 	if( is_fullfilled ) _onFulfil(result);

			// 	else if( is_rejected ) _onReject(result);

			// 	else {
			// 		resolve_listeners.push(_onFulfil);
			// 		reject_listeners.push(_onReject);
			// 	}


			// });

			// if( is_fullfilled ) return resolvedFuture( onFulfil instanceof Function ? onFulfil(result) : result );
			if( is_fullfilled ) {
				return onFulfil instanceof Function ? future(function (_resolve, _reject) {
					nextTick(function () {
						var _result;
						try{
							_result = onFulfil(result);
						} catch(_reason) {
							return _reject(_reason);
						}

						_followThen( promise, _result, _resolve, _reject );
					});
				}) : resolvedFuture(result);
			}

			// if( is_rejected ) return onReject instanceof Function ? resolvedFuture( onReject(result) ) : rejectedFuture(result);
			if( is_rejected ) {
				return onReject instanceof Function ? future(function (_resolve, _reject) {
					nextTick(function () {
						var _result;
						try{
							_result = onReject(result);
						} catch(_reason) {
							return _reject(_reason);
						}

						_followThen( promise, _result, _resolve, _reject );
					});
				}) : rejectedFuture(result);
			}

			return future(function (_resolve, _reject) {
				resolve_listeners.push( onFulfil instanceof Function ? function (_result) {
					nextTick(function () {
						var _result;
						try{
							_result = onFulfil(result);
						} catch(_reason) {
							return _reject(_reason);
						}

						_followThen( promise, _result, _resolve, _reject );
					});
				} : _resolve );

				reject_listeners.push( onReject instanceof Function ? function (_reason) {
					nextTick(function () {
						var _result;
						try{
							_result = onReject(result);
						} catch(_reason) {
							return _reject(_reason);
						}

						_followThen( promise, _result, _resolve, _reject );
					});
				} : _reject );
			});
		},
		catch: function (onReject) {
			return promise.then(null, onReject);
		},
	};

	try{
		resolver(resolve, reject);
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