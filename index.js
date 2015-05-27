'use strict';

var google = require('./lib/auth/google');
google('ya29.fwEEtAPepTANyega04pKTEya0QSUA_CEbaaS_qAYs7ChcAFFF79DmU7RF-geRgDCiHCfS2MC-a40dw')
.then(function(user) {
	console.log('got user', user);
}, function(err) {
	console.error('got error', err);
});