module.exports = {
  resolved: function (value) {
    return lang.Promise.resolve(value);
  },
  rejected: function (reason) {
    return lang.Promise.reject(reason);
  },
  deferred: function () {
    var resolver = null,
        rejector = null,
        promise = new lang.Promise(function (resolve, reject) {
          resolver = resolve;
          rejector = reject;
        });

    return {
      promise: promise,
      resolve: resolver,
      reject: rejector
    };
  }
};
