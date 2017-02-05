
# Parole

[<img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo" title="Promises/A+ 1.0 compliant" align="right" />](https://promisesaplus.com/)

Another ES6 promise implementation ([compliant](https://github.com/promises-aplus/promises-tests) with [Promises/A+](https://github.com/promises-aplus/promises-spec))

[![](https://img.shields.io/npm/v/parole.svg)](https://www.npmjs.com/package/parole) [![](https://img.shields.io/bower/v/parole.svg)](http://bower.io/search/?q=parole) [![Build Status](https://travis-ci.org/kiltjs/parole.svg?branch=master)](https://travis-ci.org/kiltjs/parole)

## Installation
```.sh
npm install parole --save

# alternatively you can use bower (minified version by default)
bower install parole --save
```

### ES6 fulfill
> `Parole` implements [ES6 Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) specs

``` js
// parole respects the es6 promise specification
// you can use parole as global polyfill

if( !window.Promise ) {
  window.Promise = Parole;
}
```

### Example
``` js
new Parole(function (resolve, reject) {
        resolve('gogogo!');
    })

    .then(function (result) {
        console.log('checkpoint 1', result);
        throw 'whoops!';
    })

    .then(function (result) {
        console.log('checkpoint 2', result);
    },function (result) {
        console.log('checkpoint 2.1', result);
        return qPromise(function (resolve, reject) {
            setTimeout(function () { resolve('all right!'); }, 400);
        });
    })

    .then(function (result) {
        console.log('checkpoint 3', result);
    }, function (reason) {
        console.log('checkpoint 3.1', reason);
    })
;
```
> output

```.sh
checkpoint 1 gogogo!
checkpoint 2.1 whoops!
# elapsed 400ms
checkpoint 3 all right!
```

### Tests
[![travis](https://cdn.travis-ci.org/images/favicon.png)](https://travis-ci.org/kiltjs/parole)
[![Build Status](https://travis-ci.org/kiltjs/parole.svg?branch=master)](https://travis-ci.org/kiltjs/parole)
[![Wercker](http://wercker.com/favicon.ico)](https://app.wercker.com/project/bykey/be7db1dae8daa1a31b992c75d8c9cf83)
[![wercker status](https://app.wercker.com/status/be7db1dae8daa1a31b992c75d8c9cf83/s "wercker status")](https://app.wercker.com/project/bykey/be7db1dae8daa1a31b992c75d8c9cf83)
``` sh
make test
```
