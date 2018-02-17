
const Parole = require('./src/parole');
const defer = require('./src/defer');

// console.log('Parole', Parole);
// console.log('new Parole', new Parole (function (resolve) {
//   // console.log('runner', this, arguments);
// }) );

var p = new Parole (function (resolve) {
  resolve(this);
}).then(function (value) {
  console.log('value', value);
  return value + 1;
}).then(function (value) {
  console.log('value', value);
  throw value + 1;
  // throw new Parole(function () {
  //   return value + 1;
  // });
}).catch(function (value) {
  console.log('value', value);
  return value + 1;
});

// function addOneLog (value) {
//   console.log('value', value);
//   return value + 1;
// }
// function throwAddOneLog (value) {
//   console.log('value', value);
//   throw value + 1;
// }
//
// defer(function (resolve) {
//     resolve(1);
//   })
//   .then(addOneLog)
//   .then(addOneLog)
//   .then(throwAddOneLog)
//   .catch(addOneLog)
//   .then(addOneLog)
// ;
