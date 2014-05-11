module.exports = {
  resolved: function (value) {
    return window.Promise.resolve(value);
  },
  rejected: function (reason) {
    return window.Promise.reject(reason);
  },
  deferred: function () {
    var resolver = null,
        rejector = null,
        promise = new window.Promise(function (resolve, reject) {
          resolver = resolve;
          rejector = reject;
        });

    return {
      promise: promise,
      resolve: resolver,
      reject: rejector
    };
  },
  Promise: window.Promise
};
