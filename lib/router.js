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
	debug('creating session');
	var session = yield Session.create(user, this.request.body.localSite);
	assignWorker(session);

	debug('session created for %s', session.publicId);

	this.set('Location', `http://${session.publicId}.${session.worker}:9001/${session.id}`);
	this.set('Connection', 'close');
	this.status = 201;
	this.body = {
		sessionId: session.id,
		publicId:  session.publicId,
		publicUrl: `http://${session.publicId}.${session.worker}`,
		localSite: session.localSite,
		worker:    session.worker,
		expiresAt: session.expiresAt
	};
});

function assertBody(ctx) {
	var body = ctx.request.body;
	if (!body || typeof body !== 'object') {
		return ctx.throw(400, 'Invalid request body');
	}

	if (!/^https?:\/\/[^\/]+\/?$/i.test(body.localSite || '')) {
		return ctx.throw(400, 'Invalid localSite');
	}
}