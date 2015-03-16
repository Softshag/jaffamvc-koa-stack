'use strict';

var etag = require('koa-etag'),
  conditional = require('koa-conditional-get'),
  qs = require('koa-qs'),
  csrf = require('koa-csrf'),
  serve = require('koa-static'),
  methodOverride = require('koa-methodoverride'),
  assign = require('object-assign');

var debug = require('debug')('mvc:middlewares');

var defaults = {
  session: {},
  static: {}
};

module.exports = function(opt) {
  opt = opt || {};

  var options = assign({}, defaults, opt);

  function check(prop) {
    if (options.exclude) {
      let ret = !~options.exclude.indexOf(prop);

      debug('%s: %s', ret ? 'enabling' : 'disabling', prop);

      return ret;
    }
    debug('enabling %s', prop);
    return true;
  }

  return function * () {

    if (check('toobusy')) {
      this.use(require('./toobusy')(this, options.toobusy));
    }

    if (check('etag')) {
      this.use(conditional());
      this.use(etag());
    }

    if (check('static')) {
      this.use(serve(options.static.path || './public', {
        maxAge: options.static.maxAge || 0
      }));
    }

    if (check('methodOverride'))
      this.use(methodOverride(options.methodOverride));

    // Support for nested query strings;
    if (check('querystring'))
      qs(this, options.querystring);

    // Csrf support
    if (check('csrf'))
      csrf(this, options.csrf);

    // Body parsers
    if (check('body')) {
      this.use(require('./body')(this, options.body));
    }

    // Sessions
    // TODO: Add store options
    if (check('session')) {
      let session = yield require('./session')(this, options.session);
      this.use(session);
    }

  };

};