'use strict';

let toobusy = require('toobusy-js');

module.exports = function(options) {

  return function * (next) {
    if (toobusy(options)) {
      this.throw(503);
    } else {
      yield * next;
    }
  };

};
