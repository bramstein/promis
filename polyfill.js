goog.require('lang.Promise');

if (!window['Promise']) {
  window['Promise'] = lang.PromiseImpl;
  window['Promise']['resolve'] = lang.PromiseImpl.resolve;
  window['Promise']['reject'] = lang.PromiseImpl.reject;
  window['Promise']['race'] = lang.PromiseImpl.race;
  window['Promise']['all'] = lang.PromiseImpl.all;
  window['Promise']['prototype']['then'] = lang.PromiseImpl.prototype.then;
  window['Promise']['prototype']['catch'] = lang.PromiseImpl.prototype.catch;
}
