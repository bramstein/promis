goog.provide('lang.Promise');

goog.scope(function () {

  /**
   * @constructor
   */
  lang.Promise = function Promise(executor) {
    this.state = lang.Promise.State.PENDING;
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
  lang.Promise.State = {
    RESOLVED: 0,
    REJECTED: 1,
    PENDING: 2
  };

  var Promise = lang.Promise;

  /**
   * Create a rejected Promise.
   * @param {*} r The reason for rejection.
   * @return {!lang.Promise}
   */
  Promise.reject = function (r) {
    return new Promise(function (resolve, reject) {
      reject(r);
    });
  };

  /**
   * Create a resolved Promise.
   * @param {*} x The value to resolve the Promise with.
   * @return {!lang.Promise}
   */
  Promise.resolve = function (x) {
    return new Promise(function (resolve, reject) {
      resolve(x);
    });
  };

  /**
   * Resolve this Promise.
   * @param {*} x The value to resolve the Promise with.
   * @private
   */
	Promise.prototype.resolve = function resolve(x) {
    var promise = this;

    if (promise.state === Promise.State.PENDING) {
      if (x === promise) {
        throw new TypeError('Promise resolved with itself.');
      }

      try {
        var then = x && x['then'],
            called = false;

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
		  promise.state = Promise.State.RESOLVED;
		  promise.value = x;
      promise.notify();
    }
	};

  /**
   * Reject this Promise.
   * @private
   * @param {*} reason The reason for rejection.
   */
	Promise.prototype.reject = function reject(reason) {
    var promise = this;

    if (promise.state === Promise.State.PENDING) {
      if (reason === promise) {
        throw new TypeError('Promise rejected with itself.');
      }

      promise.state = Promise.State.REJECTED;
		  promise.value = reason;
      promise.notify();
    }
	};

  /**
   * Notify all handlers of a change in state.
   * @private
   */
	Promise.prototype.notify = function notify() {
    var promise = this;

    setTimeout(function () {
      if (promise.state !== Promise.State.PENDING) {
        while (promise.deferred.length) {
          var deferred = promise.deferred.shift(),
              onResolved = deferred[0],
              onRejected = deferred[1],
              resolve = deferred[2],
              reject = deferred[3];

          try {
            if (promise.state === Promise.State.RESOLVED) {
              if (typeof onResolved === 'function') {
                resolve(onResolved.call(undefined, promise.value));
              } else {
                resolve(promise.value);
              }
            } else if (promise.state === Promise.State.REJECTED) {
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
    }, 0);
  };

  /**
   * @param {function(*):*=} onResolved Called when this Promise is resolved.
   * @param {function(*):*=} onRejected Called when this Promise is rejected.
   * @return {!lang.Promise}
   */
	Promise.prototype.then = function then(onResolved, onRejected) {
		var promise = this;

    return new Promise(function (resolve, reject) {
      promise.deferred.push([onResolved, onRejected, resolve, reject]);
      promise.notify();
    });
	};
});

window['Promise'] = lang.Promise;
window['Promise']['resolve'] = lang.Promise.resolve;
window['Promise']['reject'] = lang.Promise.reject;
window['Promise']['prototype']['then'] = lang.Promise.prototype.then;