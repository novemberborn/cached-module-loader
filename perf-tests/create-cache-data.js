var fs = require('fs');
var path = require('path');
var bundler = require('../');

bundler.bundleDependencies('babel-core').then(({cachedData, code}) => {
	fs.writeFileSync(path.join(__dirname, '.cached-data.bin'), cachedData);
	fs.writeFileSync(path.join(__dirname, '.cached-code.js'), code);
});
