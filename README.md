<a href="http://promisesaplus.com/">
  <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo" title="Promises/A+ 1.0 compliant" align="right" />
</a>

## Promis: a small embeddable Promise polyfill

This is a tiny (0.8KB gzipped, 1.9KB minified) Promise implementation meant for embedding in other projects and use as a standalone polyfill. It supports the full Promise API specification and passes the official Promises/A+ test suite.

### API

The constructor is called with a single function argument.

```javascript
var promise = new Promise(function (resolve, reject) {
  resolve('hello');
});
```

Instances of a Promise have two methods available: `then` and `catch`. The `then` method is used to add callbacks for when the promise is resolved or rejected.

```javascript
promise.then(function (x) {
  console.log('value is', x);
}, function (r) {
  console.log('reason is', r);
});
```

The `catch` method is used the catch rejected promises in a more convenient way.

```javascript
promise.catch(function (r) {
  console.log('reason is', r);
});
```

Both methods return a new Promise that can be used for chaining.

The Promise class also has four class methods: `resolve`, `reject`, `race` and `all`. The `resolve` and `reject` methods are a convenient way of creating already settled promises:

```javascript
var resolved = Promise.resolve('hello');
var rejected = Promise.reject('bye');
```

The `race` method can be used to "race" two or more promises against each other. The returned promises is settled with the result of the first promise that settles.

```javascript
// first will be resolved with 'hello'
var first = Promise.race([new Promise(function (resolve) {
  setTimeout(function () {
    resolve('world');
  }, 1000);
}), Promise.resolve('hello')]);
```

The `all` method waits for all promises given to it to resolve and then resolves the promise with the result of all of them.

```javascript
// all is settles with ['hello', 'world']
var all = Promise.all([Promise.resolve('hello'), Promise.resolve('world')]);
```

You can find more information about Promises and the API in the [official Promise specification](http://promisesaplus.com/) and on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### Tests

Use the `grunt test` task to run all the tests. You can optionally pass the `--compiled` flag to test the compiled and minified JavaScript file.

### Embedding

This implementation uses Closure Compiler's advanced optimization mode to make the resulting file size as small as possible. If you want to embed this library into your project you can also benefit from Closure Compiler's dead code elimination to remove methods that you are not using. If you want to use Promis this way, you'll need to copy `src/promise.js` into your project and `goog.require` the implementation. Unlike the [standalone file](promise.js), the `src/promise.js` file by itself does not export anything to the global namespace. Instead you should require the `lang.Promise` namespace to instantiate a Promise.

```javascript
goog.require('lang.Promise');

...

var promise = new lang.Promise(function (resolve, reject) {
  resolve('hello');
});
```

### License

Licensed under the [BSD license](LICENSE).
Copyright 2014 - Bram Stein. All rights reserved.
