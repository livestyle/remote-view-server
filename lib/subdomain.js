/**
 * Generates random sub-domain consisting of adjective and noun
 */
'use strict';
var db = require('./words.json');

// to reduce memory footprint, convert all words to buffers 
// (takes twice less memory since all string in JS are UTF16)
db.adjectives = db.adjectives.map(Buffer);
db.nouns = db.nouns.map(Buffer);

module.exports = function() {
	var a = Math.floor(Math.random() * db.adjectives.length);
	var n = Math.floor(Math.random() * db.nouns.length);
	return db.adjectives[a].toString() + '-' + db.nouns[n].toString();
};