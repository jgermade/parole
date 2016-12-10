/* global describe, it */

if( typeof require !== 'undefined' ) { // if is nodejs (not browser)
  var Parole = require('../parole');
  var assert = require('assert');
}

describe('promise resolution', function () {

    it('testing resolution', function(done) {

      Parole(function (resolve) {
        resolve('gogogo!');
      })

      .then(function (result) {
        assert.equal(result, 'gogogo!');
        done();
      });

    });

    it('reject resolution', function(done) {

      Parole(function (resolve, reject) {
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

    // it("reject uncough", function(done) {
    //
    //   assert.throws(function(_done) {
    //
    //       Parole(function (resolve, reject) {
    //         reject('foobar');
    //       })
    //
    //       .catch(function (reason) {
    //         throw 'uncough';
    //       });
    //
    //       setTimeout(_done, 10);
    //
    //   });
    //   }, /Uncaught \(in promise\)/ );
    //
    // });

});

describe('promise interception', function () {

    it('testing interception resolve', function(done) {

      Parole(function (resolve) {
        resolve('foobar');
      })

      .then(function () {
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

    it('testing interception resolve to reject', function(done) {

      Parole(function (resolve) {
        resolve('foobar');
      })

      .then(function () {
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

    it('testing interception reject', function(done) {

      Parole(function (resolve, reject) {
        reject('foobar');
      })

      .catch(function () {
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

    it('testing interception reject to resolve', function(done) {

      Parole(function (resolve, reject) {
        reject('foobar');
      })

      .catch(function () {
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

    it('testing interception resolve returning promise', function(done) {

      Parole(function (resolve, reject) {
        reject('foobar');
      })

      .catch(function () {
        return Parole(function (resolve) {
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

describe('promise all', function () {

    it('list resolved', function(done) {

      var p = Parole.all([
        Parole(function (resolve) {
          setTimeout(function () {
            resolve('foo');
          }, 1);
        }),
        Parole(function (resolve) {
          setTimeout(function () {
            resolve('bar');
          }, 1);
        })
      ]);

      p.then(function (results) {
          assert.equal(results.join('.'), 'foo.bar');
          done();
        });
    });

    it('list rejected', function(done) {

      Parole.all([
        Parole(function (resolve) {
          setTimeout(function () {
            resolve('ok');
          }, 1);
        }),
        Parole(function (resolve, reject) {
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

    it('list mixed', function(done) {

      Parole.all([
        Parole(function (resolve) {
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

    it('list values', function(done) {

      Parole.all([
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

    it('resolve', function(done) {

      Parole.race([
        Parole(function (resolve) {
          setTimeout(function () {
            resolve('winner');
          }, 10);
        }),
        Parole(function (resolve) {
          setTimeout(function () {
            resolve('second');
          }, 20);
        }),
        Parole(function (resolve) {
          setTimeout(function () {
            resolve('third');
          }, 30);
        })
      ])

        .then(function (result) {
          assert.equal(result, 'winner');
          done();
        });

    });

});

describe('promise race', function () {

    it('reject', function(done) {

      Parole.race([
        Parole(function (resolve, reject) {
          setTimeout(function () {
            reject('winner');
          }, 10);
        }),
        Parole(function (resolve, reject) {
          setTimeout(function () {
            reject('second');
          }, 20);
        }),
        Parole(function (resolve, reject) {
          setTimeout(function () {
            reject('third');
          }, 30);
        })
      ])

        .catch(function (reason) {
          assert.equal(reason, 'winner');
          setTimeout(done, 1);
        });

    });

});

describe('promise then', function () {

    it('resolve', function(done) {

      Parole(function (resolve) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return Parole.resolve(result);
        })

        .then(function (result) {
          assert.equal(result, 'gogogo!');
          done();
        });

    });

    it('reject', function(done) {

      Parole(function (resolve) {
        resolve('gogogo!');
      })

        .then(function () {
          return Parole.reject('whoops!');
        })

        .catch(function (result) {
          assert.equal(result, 'whoops!');
          done();
        });

    });

    it('when resolve', function(done) {

      Parole(function (resolve) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return Parole.when(result);
        })

        .then(function (result) {
          assert.equal(result, 'gogogo!');
          done();
        });

    });

    it('when reject', function(done) {

      Parole(function (resolve) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return Parole.when(result).then(function () {
            throw 'whoops!';
          });
        })

        .catch(function (result) {
          assert.equal(result, 'whoops!');
          done();
        });

    });

    it('Parole.resolve', function(done) {

      Parole(function (resolve) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return Parole.resolve(result);
        })

        .then(function (result) {
          assert.equal(result, 'gogogo!');
          done();
        });

    });

    it('Parole.reject', function(done) {

      Parole(function (resolve) {
        resolve('gogogo!');
      })

        .then(function () {
          return Parole.reject('whoops!');
        })

        .catch(function (result) {
          assert.equal(result, 'whoops!');
          done();
        });

    });

});
