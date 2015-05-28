'use strict';

var mongoose = require('mongoose');
var debug = require('debug')('rv:model:user');
var utils = require('../utils');

var Schema = mongoose.Schema;
var Model = mongoose.Model;
var megabyte = 1024 * 1024 * 1024;

const QUOTA = 500 * megabyte;

var userSchema = new Schema({
	email: {
		type: String, 
		required: true, 
		lowercase: true,
		unique: true
	},
	name: String,
	role: {type: String, default: 'user'},
	image: String,
	vendorId: String,
	gender: String,
	created: {type: Date, default: Date.now},
	lastAccess: {type: Date, default: Date.now},
	traffic: {},
	enabled: Boolean
});

userSchema.statics.findByEmail = function(email) {
	email = email.toLowerCase();
	debug('search by email %s', email);
	return this.findOne({email});
};

userSchema.statics.createOrUpdate = function(data) {
	debug('create or update user');
	if (!data.email) {
		let err = new Error('No email specified');
		debug(err);
		return Promise.reject(err);
	}

	return User.findByEmail(data.email)
	.then(function(user) {
		if (user) {
			debug('user found, update');
			user.set(data);
		} else {
			debug('user not found, create new');
			user = new User(data);
		}

		return user.save();
	});
};

userSchema.methods.throttleSave = utils.throttle(function() {
	this.save();
}, 10000);

userSchema.virtual('quota').get(function() {
	return QUOTA
});

userSchema.virtual('traffic.current')
.get(function() {
	return this.traffic[day()] || 0;
})
.set(function(value) {
	value = parseInt(value, 10);
	if (!isNaN(value)) {
		var d = day();
		this.traffic[d] = value;
		this.markModified(`traffic.${d}`);
		this.throttleSave();
	}
});

var User = module.exports = mongoose.model('User', userSchema);

/**
 * Returns a day token for given date
 * @param  {Date} date Date object (defaults to current date)
 * @return {String}
 */
function day(date) {
	date = date || new Date;
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function pad(num) {
	return num > 9 ? String(num) : '0' + num;
}
