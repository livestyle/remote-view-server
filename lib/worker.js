/**
 * A simple stub that assigns worker for given session. In future (I hope :)
 * Remote View will support multiple workers
 */
'use strict';

module.exports = function(session) {
	session.worker = 'livestyle.io';
	session.save(); // no need to save before return, can save later
	return session;
};