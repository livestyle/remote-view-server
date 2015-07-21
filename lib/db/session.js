'use strict';

var mongoose = require('mongoose');
var debug = require('debug')('rv:model:session');
var subdomain = require('../subdomain');

const SESSION_TTL = 3 * 60 * 60 * 1000; // 3 hours

var sessionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User', 
		required: true
	},
	publicId: {   // public sub-domain, e.g 'some-name.livestyle.io'
		type: String, 
		required: true
	},
	localSite: { // local web-site url, e.g. 'http://localhost:8001'
		type: String,
		required: true,
		match: [/^https?:\/\/[^\/]+\/?$/i, 'Invalid local domain name: {VALUE}']
	},
	traffic: {  // number of bytes transmitted in this session
		type: Number, 
		default: 0
	},
	created: {
		type: Date, 
		default: Date.now
	},
	expiresAt: {
		type: Date,
		default: function() {
			return Date.now() + SESSION_TTL;
		}
	},
	active: {
		type: Boolean,
		default: true
	}
});

sessionSchema.index({user: 1, active: 1, localSite: 1});
sessionSchema.index({active: 1, publicId: 1});

sessionSchema.statics.create = function(user, localSite) {
	debug('create session for user %s', user.email);
	// Generate a publicId but make sure it does not
	// clashes with existing one.
	// To reduce DB access, generate a bunch of names and check
	// which one doesn’t exists
	var names = [];
	while (names.length < 10) {
		let name = subdomain() + '.livestyle.io';
		if (names.indexOf(name) === -1) {
			names.push(name);
		}
	}

	debug('check for unique publicId');
	return this.find({active: 1, publicId: {$in: names}}, 'publicId -_id')
	.then(function(items) {
		var publicId;
		if (!items.length) {
			debug('no duplicates');
			publicId = names[0];
		} else {
			debug('duplicates found, filter');
			var dupes = items.map(function(item) {
				return item.publicId;
			});

			names.some(function(name) {
				if (dupes.indexOf(name) === -1) {
					return publicId = name;
				}
			});
		}

		if (!publicId) {
			// we shouldn’t be here
			throw new Error('Unable to get publicId for session');
		}

		return new Session({
			user: user.id,
			publicId,
			localSite
		}).save();
	});
};

/**
 * Returns active session for given user and local site, if exists
 * @param  {User} user
 * @param  {String} localSite
 * @return {Promise}
 */
sessionSchema.statics.getActive = function(user, localSite) {
	return this.findOne({
		user: user.id, 
		active: 1, 
		localSite: localSite
	});
};

var Session = module.exports = mongoose.model('Session', sessionSchema);