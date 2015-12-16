jsTools: promise-q [![wercker status](https://app.wercker.com/status/776fd083031e0baa85545897a2fc6cfa/s "wercker status")](https://app.wercker.com/project/bykey/776fd083031e0baa85545897a2fc6cfa)
==================
[![](https://img.shields.io/npm/v/promise-q.svg)](https://www.npmjs.com/package/promise-q) [![](https://img.shields.io/bower/v/promise-q.svg)](http://bower.io/search/?q=promise-q) [![](https://img.shields.io/npm/dm/promise-q.svg)](https://www.npmjs.com/package/promise-q)
Installation
------------
```.sh
npm install promise-q --save
```
  or
```.sh
bower install promise-q --save
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
