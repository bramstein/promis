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

  describe('#toString', function () {
  });

  describe('race', function () {
  });

  describe('all', function () {
  });
});
