/* global describe, it */

if( typeof require !== 'undefined' ) { // if is nodejs (not browser)
  var $q = require('../q');
  var assert = require('assert');
}

describe('promise resolution', function () {

    it('testing resolution', function(done) {

      $q(function (resolve) {
        resolve('gogogo!');
      })

      .then(function (result) {
        assert.equal(result, 'gogogo!');
        done();
      });

    });

    it('reject resolution', function(done) {

      $q(function (resolve, reject) {
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
    //       $q(function (resolve, reject) {
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

      $q(function (resolve) {
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

      $q(function (resolve) {
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

      $q(function (resolve, reject) {
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

      $q(function (resolve, reject) {
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

      $q(function (resolve, reject) {
        reject('foobar');
      })

      .catch(function () {
        return $q(function (resolve) {
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

      var p = $q.all([
        $q(function (resolve) {
          setTimeout(function () {
            resolve('foo');
          }, 1);
        }),
        $q(function (resolve) {
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

      $q.all([
        $q(function (resolve) {
          setTimeout(function () {
            resolve('ok');
          }, 1);
        }),
        $q(function (resolve, reject) {
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

      $q.all([
        $q(function (resolve) {
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

      $q.all([
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

      $q.race([
        $q(function (resolve) {
          setTimeout(function () {
            resolve('winner');
          }, 10);
        }),
        $q(function (resolve) {
          setTimeout(function () {
            resolve('second');
          }, 20);
        }),
        $q(function (resolve) {
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

      $q.race([
        $q(function (resolve, reject) {
          setTimeout(function () {
            reject('winner');
          }, 10);
        }),
        $q(function (resolve, reject) {
          setTimeout(function () {
            reject('second');
          }, 20);
        }),
        $q(function (resolve, reject) {
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

      $q(function (resolve) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return $q.resolve(result);
        })

        .then(function (result) {
          assert.equal(result, 'gogogo!');
          done();
        });

    });

    it('reject', function(done) {

      $q(function (resolve) {
        resolve('gogogo!');
      })

        .then(function () {
          return $q.reject('whoops!');
        })

        .catch(function (result) {
          assert.equal(result, 'whoops!');
          done();
        });

    });

    it('when resolve', function(done) {

      $q(function (resolve) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return $q.when(result);
        })

        .then(function (result) {
          assert.equal(result, 'gogogo!');
          done();
        });

    });

    it('when reject', function(done) {

      $q(function (resolve) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return $q.when(result).then(function () {
            throw 'whoops!';
          });
        })

        .catch(function (result) {
          assert.equal(result, 'whoops!');
          done();
        });

    });

    it('$q.resolve', function(done) {

      $q(function (resolve) {
        resolve('gogogo!');
      })

        .then(function (result) {
          return $q.resolve(result);
        })

        .then(function (result) {
          assert.equal(result, 'gogogo!');
          done();
        });

    });

    it('$q.reject', function(done) {

      $q(function (resolve) {
        resolve('gogogo!');
      })

        .then(function () {
          return $q.reject('whoops!');
        })

        .catch(function (result) {
          assert.equal(result, 'whoops!');
          done();
        });

    });

});
