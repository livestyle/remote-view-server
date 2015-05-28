'use strict';

var koa = require('koa');
var router = require('koa-router')();
var mongoose = require('mongoose');
var debug = require('debug')('rv:server');
var sessionAuth = require('./lib/authorize');

var app = koa();
mongoose.connect('mongodb://localhost:27017/rv');

// Creates a new connection of user local host and publicly-available host name 
// (aka reverse tunnel)
router.post('/connect', function *(next) {
	var auth = this.get('Authorization');
	if (!auth) {
		return this.throw(401, 'No authorization header');
	}

	debug('authorizing user');
	var user = yield sessionAuth(auth);
	debug('user received');
	if (!user) {
		return this.throw('User not created');
	}

	// TODO create session
	this.set('Location', 'http://w1.livestyle.io/sess-id');
	this.status = 201;
	this.body = {
		email: user.email,
		name: user.name
	};
});


app
.use(router.routes())
.use(router.allowedMethods())
.listen(9004);

console.log('Created server on 9004 port');