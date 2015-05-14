'use strict';

var etag = require('koa-etag'),
  conditional = require('koa-conditional-get'),
  qs = require('koa-qs'),
  csrf = require('koa-csrf'),
  serve = require('koa-static'),
  methodOverride = require('koa-methodoverride'),
  assign = require('object-assign'),
  view = require('co-views');

var debug = require('debug')('mvc:middlewares');

var defaults = {
  session: {},
  static: {}
};

module.exports = function(opt) {
  opt = opt || {};

  var options = assign({}, defaults, opt);

  // Simple check for feature in exclude array
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

    if (check('views') && options.views && options.views.path) {

      const render = views(options.views.path, options);
      this.context.render = function (tmpl, locals) {
        return render(tmpl, locals);
      };
      /*this.use(function *() {

      });*/


    }

  };

};

assign(module.exports, {
  etag: etag,
  conditional: conditional,
  qs: qs,
  csrf: csrf,
  serve: serve,
  methodOverride: methodOverride
});

