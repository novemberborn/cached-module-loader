var fs = require('fs');
var path = require('path');
var bundler = require('../');

var cachedData = new Promise((resolve) => {
	fs.readFile(path.join(__dirname, '.cached-data.bin'), (e, r) => resolve(r));
});

var code = new Promise((resolve) => {
	fs.readFile(path.join(__dirname, '.cached-code.js'), (e, r) => resolve(r));
});

cachedData.then(cachedData => {
	code.then(code => {
		var babel = bundler.loadInThisContext(require.resolve('babel-core'), module, {
			mid: 'babel-core',
			cachedData,
			code
		});

		require('babel-core');
	});
});