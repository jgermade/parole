jsTools: q-promise [![wercker status](https://app.wercker.com/status/be7db1dae8daa1a31b992c75d8c9cf83/s "wercker status")](https://app.wercker.com/project/bykey/be7db1dae8daa1a31b992c75d8c9cf83)
==================
[![](https://img.shields.io/npm/v/q-promise.svg)](https://www.npmjs.com/package/q-promise) [![](https://img.shields.io/bower/v/q-promise.svg)](http://bower.io/search/?q=q-promise) [![](https://img.shields.io/npm/dm/q-promise.svg)](https://www.npmjs.com/package/q-promise)
Installation
------------
```.sh
npm install q-promise --save
```
  or
```.sh
bower install q-promise --save
```
Usage
-----
```.js
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
