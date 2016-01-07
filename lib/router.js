/**
 * REST routes for Remote View server API
 */
var router = module.exports = require('koa-router')();
var debug = require('debug')('rv:router');
var authorize = require('./authorize');
var Session = require('./db/session');
var assignWorker = require('./worker');

// Creates a new connection of user local host and publicly-available host name 
// (aka reverse tunnel)
router.post('/connect', function *(next) {
	var auth = this.get('Authorization');
	if (!auth) {
		return this.throw(401, 'No authorization header');
	}

	assertBody(this);

	debug('authorizing user');
	var user = yield authorize(auth);

	debug('check if session for given localSite exists');
	var session = yield Session.getActive(user, this.request.body.localSite);
	if (!session) {
		debug('creating session');
		session = yield Session.create(user, this.request.body.localSite);
		debug('session created for %s', session.publicId);
	} else {
		debug('session exists for %s', session.publicId);
	}

	var worker = assignWorker(session);

	var connectUrl = `${worker}/${session.id}`;
	this.set('Location', connectUrl);
	this.set('Connection', 'close');
	this.status = 201;
	this.body = {
		sessionId:  session.id,
		publicId:   session.publicId,
		localSite:  session.localSite,
		connectUrl: connectUrl,
		expiresAt:  session.expiresAt
	};
});

function assertBody(ctx) {
	var body = ctx.request.body;
	debug('request body: %o', body);
	if (!body || typeof body !== 'object') {
		return ctx.throw(400, 'Invalid request body');
	}

	debug('validating %s', body.localSite);
	if (!/^https?:\/\/[^\/]+\/?$/i.test(body.localSite || '')) {
		return ctx.throw(400, 'Invalid local site ' + body.localSite);
	}
}