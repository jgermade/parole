
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

export default nextTick;