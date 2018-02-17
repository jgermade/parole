function Test (runContext) {
  runContext();
}

Test.prototype.then = function () {
  return new Test(function () {
    console.log('Test.prototype.then', this );
  });
};


// new Test(function () {}).then(function () {})
