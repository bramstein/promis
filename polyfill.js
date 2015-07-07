goog.require('lang.Promise');

if (!window['Promise']) {
  window['Promise'] = lang.Promise;
  window['Promise']['resolve'] = lang.Promise.resolve;
  window['Promise']['reject'] = lang.Promise.reject;
  window['Promise']['race'] = lang.Promise.race;
  window['Promise']['all'] = lang.Promise.all;
  window['Promise']['prototype']['then'] = lang.Promise.prototype.then;
  window['Promise']['prototype']['catch'] = lang.Promise.prototype.catch_;
}
