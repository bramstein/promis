var adapter = require('../build/promise.test.js'),
    expect = require('expect.js');

describe('Promise', function () {
  var Promise = adapter.Promise;

  describe('#constructor', function () {
    it('creates an object', function () {
      expect(new Promise(function () {})).to.be.an('object');
    });

    it('calls the executor function immediately with `resolve` and `reject`', function (done) {
      new Promise(function (resolve, reject) {
        expect(resolve).to.be.a('function');
        expect(reject).to.be.a('function');
        done();
      });
    });

    it('catches if the executor function throws', function () {
      expect(function () {
        new Promise(function (resolve, reject) {
          throw new Error('Should be caught.');
        });
      }).to.not.throwException();
    });
  });

  describe('#then', function () {
    it('creates a promise with a `then` method', function () {
      expect(new Promise(function () {}).then).to.be.a('function');
    });

    it('calls the correct callback when resolved', function (done) {
      new Promise(function (resolve, reject) {
        resolve('hello');
      }).then(function (x) {
        expect(x).to.eql('hello');
        done();
      });
    });

    it('calls the correct callback when resolved after a delay', function (done) {
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve('hello');
        }, 50);
      }).then(function (x) {
        expect(x).to.eql('hello');
        done();
      });
    });

    it('calls the correct callback when rejected', function (done) {
      new Promise(function (resolve, reject) {
        reject('bye');
      }).then(function () {}, function (r) {
        expect(r).to.eql('bye');
        done();
      });
    });

    it('calls the correct callback when rejected after a delay', function (done) {
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject('bye');
        }, 50);
      }).then(function () {}, function (r) {
        expect(r).to.eql('bye');
        done();
      });
    });

    it('can handle a thenable', function (done) {
      new Promise(function (resolve, reject) {
        resolve('hello');
      }).then(function (x) {
        expect(x).to.eql('hello');
        return {
          then: function () {
            done();
          }
        };
      });
    });

    // The above tests are simple on purpose, because we include
    // the entire Promises/A+ tests suite here.
    require('promises-aplus-tests').mocha(adapter);
  });

  describe('resolve', function () {
    it('has a resolve method', function () {
      expect(Promise.resolve).to.be.a('function');
    });

    it('returns a resolved promise with the correct value', function (done) {
      Promise.resolve('hello').then(function (x) {
        expect(x).to.eql('hello');
        done();
      });
    });
  });

  describe('reject', function () {
    it('has a reject method', function () {
      expect(Promise.reject).to.be.a('function');
    });

    it('returns a rejected promise with the correct reason', function (done) {
      Promise.reject('bye').then(function () {}, function (r) {
        expect(r).to.eql('bye');
        done();
      });
    });
  });

  describe('#catch', function () {
    it('has a a `catch` method', function () {
      expect(new Promise(function () {}).catch).to.be.a('function');
    });

    it('is not called when the promise is resolved', function (done) {
      var catchCalled = false;

      new Promise(function (resolve, reject) {
        resolve('hello');
      }).catch(function () {
        catchCalled = true;
      }).then(function (x) {
        expect(x).to.eql('hello');
        expect(catchCalled).to.be(false);
        done();
      });
    });

    it('is called when the promise is rejected', function (done) {
      new Promise(function (resolve, reject) {
        reject('bye');
      }).catch(function (r) {
        expect(r).to.eql('bye');
        done();
      });
    });
  });

  describe('race', function () {
    it('should race a single resolved promise', function (done) {
      Promise.race([Promise.resolve('hello')]).then(function (x) {
        expect(x).to.eql('hello');
        done();
      });
    });

    it('should race a single rejected promise', function (done) {
      Promise.race([Promise.reject('bye')]).then(function () {}, function (r) {
        expect(r).to.eql('bye');
        done();
      });
    });

    it('should race two resolved promises', function (done) {
      Promise.race([Promise.resolve('hello'), Promise.resolve('world')]).then(function (x) {
        expect(x).to.eql('hello');
        done();
      });
    });

    it('should race one delayed and one resolved promise', function (done) {
      Promise.race([new Promise(function (resolve) {
        setTimeout(function () {
          resolve('hello');
        }, 50);
      }), Promise.resolve('world')]).then(function (x) {
        expect(x).to.eql('world');
        done();
      });
    });

    it('should race one delayed and one rejected promise', function (done) {
      Promise.race([new Promise(function (resolve) {
        setTimeout(function () {
          resolve('hello');
        }, 50);
      }), Promise.reject('bye')]).then(function () {}, function (x) {
        expect(x).to.eql('bye');
        done();
      });
    });

    it('should race two delayed promises', function (done) {
      Promise.race([new Promise(function (resolve) {
        setTimeout(function () {
          resolve('hello');
        }, 100);
      }), new Promise(function (resolve) {
        setTimeout(function () {
          resolve('world');
        }, 50);
      })]).then(function (x) {
        expect(x).to.eql('world');
        done();
      });
    });

    it('converts a non-promise to a promise', function (done) {
      Promise.race(['hello', Promise.resolve('world')]).then(function (x) {
        expect(x).to.eql('hello');
        done();
      });
    });
  });

  describe('all', function () {
    it('should resolve all with zero promises', function (done) {
      Promise.all([]).then(function (x) {
        expect(x).to.eql([]);
        done();
      });
    });

    it('returns all resolved promises', function (done) {
      Promise.all([Promise.resolve('hello'), Promise.resolve('world')]).then(function (x) {
        expect(x).to.eql(['hello', 'world']);
        done();
      });
    });

    it('rejects the promise if one of all is rejected', function (done) {
      Promise.all([Promise.resolve('hello'), Promise.reject('bye')]).then(function () {}, function (r) {
        expect(r).to.eql('bye');
        done();
      });
    });

    it('returns all promises in order with delays', function (done) {
      Promise.all([new Promise(function (resolve) {
        setTimeout(function () {
          resolve('hello');
        }, 50);
      }), Promise.resolve('world')]).then(function (x) {
        expect(x).to.eql(['hello', 'world']);
        done();
      });
    });

    it('converts a non-promise to a promise', function (done) {
      Promise.all(['hello', Promise.resolve('world')]).then(function (x) {
        expect(x).to.eql(['hello', 'world']);
        done();
      });
    });
  });
});
