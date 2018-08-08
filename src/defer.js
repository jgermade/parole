
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

const PENDING = 0;
const FULFILLED = 1;
const REJECTED = -1;

function _runTryThen (then, value, resolve, reject) {
	var result;
	try {
		result = then(value);
	} catch(reason) {
		reject(reason);
	}

	if( (typeof result === 'object' || typeof result === 'object') && 'then' in result )  {
		result.then(resolve, reject);
	} else resolve(result);
}

function _tryThen (then, resolve, reject) {
	return function (result) {
		_runTryThen(then, result, resolve, reject);
	};
}

function _tryThenResult (then, result, resolve, reject) {
	return function () {
		_runTryThen(then, result, resolve, reject);
	};
}

function _runThen (status, result, onFulfil, onReject, on_fulfil, on_reject) {
	var deferred = defer();

	if( status === FULFILLED ) {
		if( onFulfil instanceof Function ) {
			nextTick( _tryThenResult(onFulfil, result, deferred.resolve, deferred.reject ) );
		} else deferred.resolve(result);

		return deferred;
	}

	if( status === REJECTED ) {
		if( onReject instanceof Function ) {
			nextTick( _tryThenResult(onReject, result, deferred.resolve, deferred.reject ) );
		} else deferred.reject(result);
		return deferred;
	}

	if( onFulfil instanceof Function ) on_fulfil.push( _tryThen(onFulfil, deferred.resolve, deferred.reject ) );
	else on_fulfil.push(deferred.resolve);


	if( onReject instanceof Function ) on_reject.push( _tryThen(onReject, deferred.resolve, deferred.reject ) );
	else on_reject.push(deferred.reject);

	return deferred.promise;
}

function runQueue (queue, result) {
	return function () {
		for( var i = 0, n = queue.length; i < n ; i++ ) queue[i](result);
	};
}

function defer (_resolver) {

	var status = PENDING,
			result = null,
			on_fulfil = [],
			on_reject = [],
			promise = {
				then: function (onFulfil, onReject) {
					return _runThen(status, result, onFulfil, onReject, on_fulfil, on_reject);
				},
				catch: function (onReject) {
					return _runThen(status, result, null, onReject, on_fulfil, on_reject);
				},
			};

	function resolve (value) {
		if( status !== PENDING ) return;

		if( value === promise ) throw new TypeError('A promise can not be resolved by itself');

		if( (typeof value === 'object' || typeof value === 'object') && 'then' in value )  {

			value.then(resolve, reject);

		} else {
			status = FULFILLED;
			result = value;

			nextTick( runQueue(on_fulfil, result) );
		}

	}

	function reject (reason) {
		if( status !== PENDING ) return;

		status = REJECTED;
		result = reason;

		nextTick( runQueue(on_reject, result) );
	}

	// if( _resolver instanceof Function ) {
	// 	try{
	// 		_resolver(resolve, reject);
	// 	} catch(reason) {
	// 		reject(reason);
	// 	}

	// 	return promise;
	// }

	return {
		promise: promise,
		resolve: resolve,
		reject: reject,
	};
}

defer.resolve = function (result) {
	// return defer(function (resolve) {
	// 	resolve(result);
	// });
	var deferred = defer();
	deferred.resolve(result);
	return deferred.promise;
};

defer.reject = function (result) {
	var deferred = defer();
	deferred.reject(result);
	return deferred.promise;
};

module.exports = defer;