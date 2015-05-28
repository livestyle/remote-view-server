/**
 * Authorizes user with Google OAuth2
 */

'use strict';

var request = require('request');
var debug = require('debug')('rv:server:google-auth');

module.exports = function(token) {
	return fetchGoogleUser(token)
		.then(normalizeUserData);
};

function fetchGoogleUser(token) {
	return new Promise(function(resolve, reject) {
		var opt = {
			json: true,
			headers: {Authorization: `Bearer ${token}`}
		};
		debug('Authenticating user with Google OAuth2 token')
		request('https://www.googleapis.com/plus/v1/people/me', opt, function(err, res, body) {
			if (err) {
				return reject(err);
			}

			debug('auth response code %d', res.statusCode);

			if (res.statusCode !== 200) {
				err = new Error(body.error.message);
				err.statusCode = res.statusCode;
				return reject(err);
			}

			if (typeof body === 'string') {
				body = JSON.parse(body);
			}

			resolve(body);
		});
	});
}

function normalizeUserData(user) {
	var email = getEmail(user);
	if (!email) {
		var err = new Error('User does not have e-mail specified');
		err.statusCode = 412;
		return Promise.reject(err);
	}

	return Promise.resolve({
		email: email,
		name: user.displayName,
		image: user.image ? user.image.url : null,
		vendorId: user.id,
		gender: user.gender
	});
}

function getEmail(user) {
	if (!user.emails || !user.emails.length) {
		return null;
	}

	var email = user.emails[0].value;
	user.emails.some(function(item) {
		if (item.type === 'account') {
			return email = item.value;
		}
	});

	return email;
}