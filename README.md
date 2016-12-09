q-promise [![](https://img.shields.io/npm/v/q-promise.svg)](https://www.npmjs.com/package/q-promise) [![](https://img.shields.io/bower/v/q-promise.svg)](http://bower.io/search/?q=q-promise)
==================
[![travis](https://cdn.travis-ci.org/images/favicon-662edf026745110e8203d8cf38d1d325.png)](https://travis-ci.org/jstools/q-promise)
[![Build Status](https://travis-ci.org/jstools/q-promise.svg?branch=master)](https://travis-ci.org/jstools/q-promise)
[![Wercker](http://wercker.com/favicon.ico)](https://app.wercker.com/project/bykey/be7db1dae8daa1a31b992c75d8c9cf83)
[![wercker status](https://app.wercker.com/status/be7db1dae8daa1a31b992c75d8c9cf83/s "wercker status")](https://app.wercker.com/project/bykey/be7db1dae8daa1a31b992c75d8c9cf83)
[![](https://img.shields.io/npm/dm/q-promise.svg)](https://www.npmjs.com/package/q-promise)

> Full [Promises/A+](https://github.com/promises-aplus/promises-spec) [compliance](https://github.com/promises-aplus/promises-tests)

[<img src="https://rawgit.com/promises-aplus/promises-spec/master/logo.svg" width="48">](https://github.com/promises-aplus/promises-spec)

## Installation
```.sh
npm install q-promise --save

# alternatively you can use bower (minified version by default)
bower install q-promise --save
```

## [ES6 Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
``` js
// q-promise respects the es6 promise specification
// you can use q-promise as global polyfill

if( !window.Promise ) {
  window.Promise = $q;
}
```

## Example
``` js
$q(function (resolve, reject) {
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
output:
```.sh
checkpoint 1 gogogo!
checkpoint 2.1 whoops!
# elapsed 400ms
checkpoint 3 all right!
```

Tests
-----
``` sh
make test
```
