/**
 * Authorizes user by given authentication scheme, most likely a value 
 * of Authorization HTTP header
 */
'use strict';

var User = require('./db/user');
var schemes = {
	'google': require('./auth/google')
};

module.exports = function(data) {
	var parts = (data || '').split(/\s+/);
	var scheme = parts.shift();
	var token = parts.join(' ').trim();

	if (!schemes[scheme]) {
		var err = new Error('Unknown authorization scheme: ' + scheme);
		err.code = 400;
		return Promise.reject(err);
	}

	return schemes[scheme](token).then(User.createOrUpdate);
};