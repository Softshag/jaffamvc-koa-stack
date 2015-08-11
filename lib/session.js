
'use strict';

const session = require('koa-generic-session'),
    debug = require('debug')('mvc:session'),
    crypto = require('mz/crypto');

module.exports = function *(app, options) {

  let i = 10, keys = [], bytes, session_store;

  while (i--) {
    bytes = yield crypto.randomBytes(10);
    keys.push(bytes.toString('hex'));
  }
  keys = options.keys || keys;
  debug('Using keys : %s', keys);
  app.keys = keys;

  session_store = options.store;

  app.use(session({
    store: session_store
  }));

  return function *(next) {
    this.request.session = this.req.session = this.session;
    yield * next;
  };
};
