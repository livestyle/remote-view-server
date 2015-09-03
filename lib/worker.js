/**
 * A simple stub that assigns worker for given session. In future (I hope :)
 * Remote View will support multiple workers
 */
'use strict';

module.exports = function(session) {
	return process.env.RV_WORKER_URL || 'http://livestyle.io:9001';
};