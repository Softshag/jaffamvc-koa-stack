'use strict'

let body = require('koa-body-parsers');


module.exports = function(app, options) {

  body(app);

  return function * (next) {

    this.request.getBody = function() {
      switch (this.is(['json', 'urlencoded'])) {
        case 'json':
          return this.json();
        case 'urlencoded':
          return this.urlencoded();
      }
    };

    this.getBody = this.request.getBody.bind(this.request);

    yield next;

  };

};
