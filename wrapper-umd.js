
(function (root, factory) {
  function moduleFactory () {
    var module = { exports: {} };
    factory(module);
    return module.exports;
  }

  if( typeof define === 'function' && define.amd ) {
      // AMD. Register as an anonymous module.
      define([], moduleFactory);
  } else if( typeof exports === 'object' && typeof module !== 'undefined' ) {
      // CommonJS
      factory(module);
  } else {
      // Browser globals
      root.Parole = moduleFactory();
  }
}(this, function (module) { // }));
