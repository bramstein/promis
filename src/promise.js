goog.provide('lang.Promise');

goog.require('lang.async');

goog.scope(function () {
  var async = lang.async;

  /**
   * Create a new Promise.
   *
   * @param {function(function(*),function(*))} executor
   * @constructor
   */
  lang.PromiseImpl = function Promise(executor) {
    /**
     * @private
     * @type {lang.PromiseImpl.State}
     */
    this.state = lang.PromiseImpl.State.PENDING;
    this.value = undefined;
    this.deferred = [];

    var promise = this;

    try {
      executor(function(x) {
        promise.resolve(x);
      }, function (r) {
        promise.reject(r);
      });
    } catch (e) {
      promise.reject(e);
    }
  };

  /**
   * @private
   * @enum {number}
   */
  lang.PromiseImpl.State = {
    RESOLVED: 0,
    REJECTED: 1,
    PENDING: 2
  };

  var PromiseImpl = lang.PromiseImpl;

  /**
   * Create a rejected Promise.
   * @param {*} r The reason for rejection.
   * @return {!lang.PromiseImpl}
   */
  PromiseImpl.reject = function (r) {
    return new PromiseImpl(function (resolve, reject) {
      reject(r);
    });
  };

  /**
   * Create a resolved Promise.
   * @param {*} x The value to resolve the Promise with.
   * @return {!lang.PromiseImpl}
   */
  PromiseImpl.resolve = function (x) {
    return new PromiseImpl(function (resolve, reject) {
      resolve(x);
    });
  };

  /**
   * Resolve this Promise.
   * @param {*} x The value to resolve the Promise with.
   * @private
   */
  PromiseImpl.prototype.resolve = function resolve(x) {
    var promise = this;

    if (promise.state === PromiseImpl.State.PENDING) {
      if (x === promise) {
        throw new TypeError('Promise settled with itself.');
      }

      var called = false;

      try {
        var then = x && x['then'];

        if (x !== null && typeof x === 'object' && typeof then === 'function') {
          then.call(x, function (x) {
            if (!called) {
              promise.resolve(x);
            }
            called = true;

          }, function (r) {
            if (!called) {
              promise.reject(r);
            }
            called = true;
          });
          return;
        }
      } catch (e) {
        if (!called) {
          promise.reject(e);
        }
        return;
      }
      promise.state = PromiseImpl.State.RESOLVED;
      promise.value = x;
      promise.notify();
    }
  };

  /**
   * Reject this Promise.
   * @private
   * @param {*} reason The reason for rejection.
   */
  PromiseImpl.prototype.reject = function reject(reason) {
    var promise = this;

    if (promise.state === PromiseImpl.State.PENDING) {
      if (reason === promise) {
        throw new TypeError('Promise settled with itself.');
      }

      promise.state = PromiseImpl.State.REJECTED;
      promise.value = reason;
      promise.notify();
    }
  };

  /**
   * Notify all handlers of a change in state.
   * @private
   */
  PromiseImpl.prototype.notify = function notify() {
    var promise = this;

    async(function () {
      if (promise.state !== PromiseImpl.State.PENDING) {
        while (promise.deferred.length) {
          var deferred = promise.deferred.shift(),
              onResolved = deferred[0],
              onRejected = deferred[1],
              resolve = deferred[2],
              reject = deferred[3];

          try {
            if (promise.state === PromiseImpl.State.RESOLVED) {
              if (typeof onResolved === 'function') {
                resolve(onResolved.call(undefined, promise.value));
              } else {
                resolve(promise.value);
              }
            } else if (promise.state === PromiseImpl.State.REJECTED) {
              if (typeof onRejected === 'function') {
                resolve(onRejected.call(undefined, promise.value));
              } else {
                reject(promise.value);
              }
            }
          } catch (e) {
            reject(e);
          }
        }
      }
    });
  };

  /**
   * @param {function(*):*} onRejected Called when this Promise is rejected.
   * @return {!lang.PromiseImpl}
   */
  PromiseImpl.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected);
  };

  /**
   * @param {function(*):*=} onResolved Called when this Promise is resolved.
   * @param {function(*):*=} onRejected Called when this Promise is rejected.
   * @return {!lang.PromiseImpl}
   */
  PromiseImpl.prototype.then = function then(onResolved, onRejected) {
    var promise = this;

    return new PromiseImpl(function (resolve, reject) {
      promise.deferred.push([onResolved, onRejected, resolve, reject]);
      promise.notify();
    });
  };

  /**
   * @param {Array.<!lang.PromiseImpl>} iterable
   * @return {!lang.PromiseImpl}
   */
  PromiseImpl.all = function all(iterable) {
    return new PromiseImpl(function (resolve, reject) {
      var count = 0,
          result = [];

      if (iterable.length === 0) {
        resolve(result);
      }

      function resolver(i) {
        return function (x) {
          result[i] = x;
          count += 1;

          if (count === iterable.length) {
            resolve(result);
          }
        };
      }

      for (var i = 0; i < iterable.length; i += 1) {
        iterable[i].then(resolver(i), reject);
      }
    });
  };

  /**
   * @param {Array.<!lang.PromiseImpl>} iterable
   * @return {!lang.PromiseImpl}
   */
  PromiseImpl.race = function race(iterable) {
    return new PromiseImpl(function (resolve, reject) {
      for (var i = 0; i < iterable.length; i += 1) {
        iterable[i].then(resolve, reject);
      }
    });
  };
});


/**
 * Set this to false if you're not using
 * Promis as a library with Closure Compiler.
 *
 * @define {boolean}
 */
var USE_AS_LIB = true;

if (USE_AS_LIB) {
  if (window['Promise']) {
    lang.Promise = window['Promise'];
    lang.Promise.prototype.then = window['Promise']['prototype']['then'];
    lang.Promise.prototype.catch = window['Promise']['prototype']['catch'];

    lang.Promise.all = window['Promise']['all'];
    lang.Promise.race = window['Promise']['race'];
    lang.Promise.resolve = window['Promise']['resolve'];
    lang.Promise.reject = window['Promise']['reject'];
  } else {
    lang.Promise = lang.PromiseImpl;
    lang.Promise.prototype.then = lang.PromiseImpl.prototype.then;
    lang.Promise.prototype.catch = lang.PromiseImpl.prototype.catch;

    lang.Promise.all = lang.PromiseImpl.all;
    lang.Promise.race = lang.PromiseImpl.race;
    lang.Promise.resolve = lang.PromiseImpl.resolve;
    lang.Promise.reject = lang.PromiseImpl.reject;
  }
}
