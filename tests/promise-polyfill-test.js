
var Promise = require('../lib/promise-addons')(require('../lib/promise-polyfill'));
var assert = require('assert');

describe('promise resolution', function () {

    it("testing resolution", function(done) {

      new Promise(function (resolve, reject) {
        resolve('gogogo!');
      })

			.then(function (result) {
        assert.equal(result, 'gogogo!');
        done();
			});

    });

    it("reject resolution", function(done) {

      new Promise(function (resolve, reject) {
        reject('foobar');
      })

      .then(function (value) {
        return 'ok ' + value;
      }).catch(function (reason) {
        throw 'whoops ' + reason;
      })

			.catch(function (reason) {
        assert.equal(reason, 'whoops foobar');
        done();
			});

    });

});

describe('promise interception', function () {

    it("testing interception resolve", function(done) {

	    new Promise(function (resolve, reject) {
	      resolve('foobar');
	    })

	    .then(function (value) {
	      return ':)';
	    })

	    .then(function (value) {
	      return 'ok ' + value;
	    }).catch(function (reason) {
	      throw 'whoops ' + reason;
	    })

			.then(function (result) {
	      assert.equal(result, 'ok :)');
	      done();
			});

    });

    it("testing interception resolve to reject", function(done) {

      new Promise(function (resolve, reject) {
        resolve('foobar');
      })

      .then(function (value) {
        throw 'oO';
      })

      .then(function (value) {
        return 'ok ' + value;
      }).catch(function (reason) {
        throw 'whoops ' + reason;
      })

			.catch(function (reason) {
        assert.equal(reason, 'whoops oO');
        done();
			});

    });

    it("testing interception reject", function(done) {

      new Promise(function (resolve, reject) {
        reject('foobar');
      })

      .catch(function (value) {
        throw 'oO';
      })

      .then(function (value) {
        return 'ok ' + value;
      }).catch(function (reason) {
        throw 'whoops ' + reason;
      })

			.catch(function (reason) {
        assert.equal(reason, 'whoops oO');
        done();
			});

    });

    it("testing interception reject to resolve", function(done) {

			new Promise(function (resolve, reject) {
	      reject('foobar');
	    })

	    .catch(function (value) {
	      return ':)';
	    })

	    .then(function (value) {
	      return 'ok ' + value;
	    }).catch(function (reason) {
	      throw 'whoops ' + reason;
	    })

			.then(function (result) {
	      assert.equal(result, 'ok :)');
	      done();
			});

    });

    it("testing interception resolve returning promise", function(done) {

	    new Promise(function (resolve, reject) {
	      reject('foobar');
	    })

	    .catch(function (value) {
	      return new Promise(function (resolve, reject) {
	        resolve(':)');
	      });
	    })

	    .then(function (value) {
	      return 'ok ' + value;
	    }).catch(function (reason) {
	      throw 'whoops ' + reason;
	    })

			.then(function (result) {
	      assert.equal(result, 'ok :)');
	      done();
			});

    });

});

// describe('promise finally', function () {
//
//     it("testing finally", function(done) {
//
//       var result = false;
//
//       var promise = new Promise(function (resolve, reject) {
//         reject('foobar');
//       })
//
//       .finally(function (value) {
// 				assert.equal(value, 'ok ;)');
//         done();
//       })
//
//         .catch(function (value) {
//           return ';)';
//         })
//
//         .then(function (value) {
//           return 'ok ' + value;
//         })
//
//       ;
//
//     });
//
// });

describe('promise all', function () {

    it("list resolved", function(done) {

      var p = Promise.all([
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve('foo');
          }, 1);
        }),
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve('bar');
          }, 1);
        })
      ])

      p.then(function (results) {
          assert.equal(results.join('.'), 'foo.bar');
          done();
        });
    });

    it("list rejected", function(done) {

      Promise.all([
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve('ok');
          }, 1);
        }),
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject('whoops');
          }, 1);
        })
      ])
        .catch(function (reason) {
          assert.equal(reason, 'whoops');
          done();
        });
    });

    it("list mixed", function(done) {

      var result = false;

      Promise.all([
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve('foo');
          }, 1);
        }),
        'bar'
      ])
        .then(function (results) {
          assert.equal( results.join('.') , 'foo.bar');
          done();
        });
    });

    it("list values", function(done) {

      var result = false;

      Promise.all([
        'foo',
        'bar'
      ])
        .then(function (results) {
          assert.equal( results.join('.') , 'foo.bar');
          done();
        });
    });

});

describe('promise race', function () {

    it("resolve", function(done) {

      Promise.race([
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve('winner');
          }, 1);
        }),
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve('second');
          }, 2);
        }),
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve('third');
          }, 3);
        })
      ])

        .then(function (result) {
          assert.equal(result, 'winner');
          done();
        });

    });

    it("reject", function(done) {

      Promise.race([
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject('winner');
          }, 1);
        }),
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject('second');
          }, 2);
        }),
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject('third');
          }, 3);
        })
      ])

        .catch(function (reason) {
          assert.equal(reason, 'winner');
          done();
        });

    });

});

describe('promise then', function () {

    it("resolve", function(done) {

      var result = false;

      new Promise(function (resolve, reject) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return Promise.resolve(result);
        })

        .then(function (result) {
          assert.equal(result, 'gogogo!');
          done();
        });

    });

    it("reject", function(done) {

      var result = false;

      new Promise(function (resolve, reject) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return Promise.reject('whoops!');
        })

        .catch(function (result) {
          assert.equal(result, 'whoops!');
          done();
        });

    });

    it("when resolve", function(done) {

      var result = false;

      new Promise(function (resolve, reject) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return Promise.when(result);
        })

        .then(function (result) {
          assert.equal(result, 'gogogo!');
          done();
        });

    });

    it("when reject", function(done) {

      var result = false;

      new Promise(function (resolve, reject) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return Promise.when(result).then(function () {
            throw 'whoops!';
          })
        })

        .catch(function (result) {
          assert.equal(result, 'whoops!');
          done();
        });

    });

    it("Promise.resolve", function(done) {

      var result = false;

      new Promise(function (resolve, reject) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return Promise.resolve(result);
        })

        .then(function (result) {
          assert.equal(result, 'gogogo!');
          done();
        });

    });

    it("Promise.reject", function(done) {

      var result = false;

      new Promise(function (resolve, reject) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return Promise.reject('whoops!');
        })

        .catch(function (result) {
          assert.equal(result, 'whoops!');
          done();
        });

    });

});
