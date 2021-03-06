'use strict';

var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var mongoose = require('mongoose');
var router = require('./lib/router');

const port = 9000;

mongoose.connect(process.env.RV_MONGO_DB || 'mongodb://localhost:27017/rv');

var app = koa()
.use(bodyParser())
.use(function *(next) {
	try {
		yield next;
	} catch (err) {
		// handle errors generated during routing
		this.status = err.status || 500;
		this.body = err.message;
		this.app.emit('error', err, this);
	}

	if (this.status >= 400 && typeof this.body === 'string') {
		// respond with JSON message 
		this.body = {
			error: {
				message: this.body,
				code: this.status
			}
		};
	}
})
.use(router.routes())
.use(router.allowedMethods())
.on('error', function(err) {
	console.error(dateMark(), err);
});

app.listen(port);
console.log(dateMark(), `Created server on ${port} port`);

function dateMark() {
	return `[${new Date()}]`;
}