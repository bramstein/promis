goog.provide('lang.async');

goog.scope(function () {
  /**
   * @type {Array.<function()>}
   */
  var queue = [];

  /**
   * TODO: Find a better name than "async".
   *
   * @param {function()} callback
   */
  lang.async = function (callback) {
    queue.push(callback);

    if (queue.length === 1) {
      lang.async.async();
    }
  };

  /**
   * @private
   */
  lang.async.run = function () {
    while (queue.length) {
      queue[0]();
      queue.shift();
    }
  };

  if (window['MutationObserver']) {
    var el = document.createElement('div');
    var mo = new MutationObserver(lang.async.run);

    mo.observe(el, { attributes: true });

    lang.async.async = function () {
      el.setAttribute("x", 0);
    };
  } else {
    lang.async.async = function () {
      setTimeout(lang.async.run);
    };
  }
});
