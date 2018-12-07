
// from: https://github.com/medikoo/next-tick
var nextTick = (function () {

  // Node.js
  if( typeof process === 'object' && process && typeof process.nextTick === 'function' ) {
		return process.nextTick
  }

  // Removed due to issues with touchmove:
  //
  // if( 'Promise' in global && typeof global.Promise.resolve === 'function' ) return (function (resolved) {
  //   return resolved.then.bind(resolved);
  // })( global.Promise.resolve() );
  //
  // https://stackoverflow.com/questions/32446715/why-is-settimeout-game-loop-experiencing-lag-when-touchstart-event-fires/35668492
  // https://bugs.chromium.org/p/chromium/issues/detail?id=567800
    
  // Removed due to issues with webview:
  //
  // from: https://github.com/wesleytodd/browser-next-tick
  // var raf_prefixes = 'oR msR mozR webkitR r'.split(' ')
  // for( var i = raf_prefixes.length - 1 ; i >= 0 ; i-- ) {
  //   if( window[raf_prefixes[i] + 'equestAnimationFrame'] ) return window[raf_prefixes[i] + 'equestAnimationFrame'].bind(window);
  // }
  
  // MutationObserver
  if( 'MutationObserver' in window || 'WebKitMutationObserver' in window ) return (function (Observer, node) {
    var queue = [],
        i = 0

    function _launchNextTick () {
      node.data = (i = ++i % 2)
    }

    var observer = new Observer(function () {
      var _callback = queue.shift()
      if( queue.length > 0 )  _launchNextTick()
      if( _callback instanceof Function ) _callback()
      // observer.disconnect()
    })
    observer.observe(node, { characterData: true })

    return function (callback) {
      queue.push(callback)
      _launchNextTick()
    }
  })( window.MutationObserver || window.WebKitMutationObserver, document.createTextNode('') )

  var _ensureCallable = function (fn) {
    if (typeof fn !== 'function') throw new TypeError(fn + ' is not a Function')
    return fn
  }

  // W3C Draft
	// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	if (typeof setImmediate === 'function') {
		return function (cb) { setImmediate(_ensureCallable(cb)) }
	}

	// Wide available standard
	if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
		return function (cb) { setTimeout(_ensureCallable(cb), 0) }
	}

})()

export default nextTick