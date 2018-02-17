/* eslint no-console: "warn" */

var Parole = require('./src/parole');
// var defer = require('./src/defer');

// eslint-disable-next-line
function addOneLog (value) {
  console.log('value', value);
  return value + 1;
}
// eslint-disable-next-line
function throwAddOneLog (value) {
  console.log('value', value);
  throw value + 1;
}


// console.log('Parole', Parole);
// console.log('new Parole', new Parole (function (resolve) {
//   // console.log('runner', this, arguments);
// }) );

var resolved = Parole.resolve('hola').then(function () {
  console.log('resolved', resolved);
  return resolved;
});

Parole.resolve('hola')
  .then(function () {
    return Parole.defer().promise;
  })
  .then(function () {
    console.log('resolved :(');
  }, function () {
    console.log('rejected :(');
  });

setTimeout(function () {}, 1000);

new Parole (function (resolve) {
  resolve(1);
}).then(function (value) {
  console.log('value', value);
  return value + 1;
}).then(function (value) {
  console.log('value', value);
  // throw value + 1;
  return Parole.reject(value + 1);
}).catch(addOneLog);

// defer(function (resolve) {
//     resolve(1);
//   })
//   .then(addOneLog)
//   .then(addOneLog)
//   .then(throwAddOneLog)
//   .catch(addOneLog)
//   .then(addOneLog)
// ;
