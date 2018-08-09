
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

function _runThen (promise, then, value, resolve, reject ) {
  return function () {
    var result;
    try {
      if( value === promise ) throw new TypeError('A promise can not be resolved by itself');
      result = then.call(promise, value);
    } catch(reason) {
      return reject(reason);
    }
    _followThen(promise, result, resolve, reject);
  };
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

			nextTick( _runQueue( resolve_listeners, result ) );
		}, reject);
	};

	var reject = function (reason) {
		// if( reason === promise ) throw new TypeError('A promise can not be resolved by itself');

		if( is_fulfilling || is_fullfilled || is_rejected ) return;

		// if( reason === promise ) throw new TypeError('A promise can not be resolved by itself');

		is_rejected = true;
		result = reason;

		// if( !reject_listeners.length && reason instanceof Error ) throw new TypeError('Uncought promise');

		nextTick( _runQueue( reject_listeners, result ) );
	};

	var promise = {
		then: function (onFulfilled, onRejected) {

			if( is_fullfilled && typeof onFulfilled !== 'function' ) return resolvedFuture(result);

			if( is_rejected && typeof onRejected !== 'function' ) return rejectedFuture(result);

			var _promise = future(function (_resolve, _reject) {

				if( is_fullfilled ) 
          nextTick( _runThen( _promise, onFulfilled, result, _resolve, _reject ) );

				else if( is_rejected )
					nextTick( _runThen( _promise, onRejected, result, _resolve, _reject ) );

				else {

					resolve_listeners.push( onFulfilled instanceof Function ? function (_result) {

						nextTick( _runThen( _promise, onFulfilled, _result, _resolve, _reject ) );

					} : _runThen(_promise, onFulfilled, result, _resolve, _reject ) );

          reject_listeners.push( onRejected instanceof Function ? function (_result) {

            nextTick( _runThen( _promise, onRejected, _result, _resolve, _reject ) );

          } : _runThen(_promise, onRejected, result, _resolve, _reject ) );
				}

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