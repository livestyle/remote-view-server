/**
 * A simple stub that assigns worker for given session. In future (I hope :)
 * Remote View will support multiple workers
 */
'use strict';

module.exports = function(session) {
	return 'http://localhost:9001';
};