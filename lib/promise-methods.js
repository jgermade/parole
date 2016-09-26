
module.exports = function (qPromise) {

	function each (iterable, handler) {
		for( var i = 0, n = iterable.length; i < n ; i++ ) {
			handler(iterable[i], i);
		}
	}

	function qResolve (result) {
	  return qPromise(function (resolve, reject) { resolve(result); });
	};

	function qReject (reason) {
	  return qPromise(function (resolve, reject) { reject(reason); });
	};

	var methods = {
		resolve: qResolve,
		reject: qReject,
		defer: function () {
		  var deferred = {};
		  deferred.promise = qPromise(function (resolve, reject) {
		    deferred.resolve = resolve;
		    deferred.reject = reject;
		  });
		  return deferred;
		},
		all: function (iterable) {
		  return qPromise(function (resolve, reject) {
		    var pending = iterable.length,
		        results = [];
		    each(iterable, function (_promise, i) {

		      ( _promise.then ? _promise : qResolve(_promise) ).then(function (result) {
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
		},
		race: function (iterable) {
		  return qPromise(function (resolve, reject) {
		    var done = false;

		    each(iterable, function (_promise, i) {
		      if( done ) {
		        return;
		      }
		      ( _promise.then ? _promise : qResolve(_promise) ).then(function (result) {
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
		}
	};

	return function (q, override) {
		for( var key in methods ) {
			if( !q[key] || override ) {
				q[key] = methods[key];
			}
		}
		return q;
	};
};
