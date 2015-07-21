'use strict';

var mongoose = require('mongoose');
var debug = require('debug')('rv:model:user');

var userSchema = new mongoose.Schema({
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
	enabled: {type:Boolean, default: true}
}, {collection: 'User'});

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
			if (!user.enabled) {
				throw new Error(`User with ${user.email} email is disabled. ` + 
					'Please contact help@livestyle.io for further details.');
			}
			user.set(data);
		} else {
			debug('user not found, create new');
			user = new User(data);
		}

		return user.save();
	});
};

var User = module.exports = mongoose.model('User', userSchema);