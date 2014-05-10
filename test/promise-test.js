var adapter = require('../build/promise.test.js');

describe('Promises/A+ Tests', function () {
  require('promises-aplus-tests').mocha(adapter);
});
