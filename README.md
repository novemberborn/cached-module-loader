# cached-module-loader

Caching bundler and loader of Node.js modules which uses the `cachedData`
feature in the `vm` module (available since Node.js 6).

**Don't use this.**

## Installation

```
$ npm install --save cached-module-loader
```

## Usage

Generate a cached bundle:

```js
const { join } = require('path')
const { writeFileSync } = require('fs')
const cachedModuleLoader = require('cached-module-loader')

cachedModuleLoader.bundleDependencies('babel-core').then(bundle => {
  writeFileSync(join(__dirname, '.cached-data.bin'), cachedData)
  writeFileSync(join(__dirname, '.cached-code.js'), code)
})
```

Read a bundle and load the module:

```js
const { join } = require('path')
const { readFileSync } = require('fs')
const cachedModuleLoader = require('cached-module-loader')

const cachedData = readFileSync(join(__dirname, '.cached-data.bin'))
const code = readFileSync(join(__dirname, '.cached-code.js'))

const babel = cachedModuleLoader.loadInThisContext(require.resolve('babel-core'), module, {
  moduleId: 'babel-core',
  cachedData,
  code
})
```

## How it works

First `cached-module-loader` records every `.js` dependency of the requested
module. These dependencies (and the module itself) are concatenated into one
bundle. `require()` calls are rewritten to use absolute paths. The dependencies
are wrapped in Node.js' standard module wrapper, and when loading modules, a
modified `require()` function is passed. This function can load modules from the
bundle rather than from disk.

A new
[vm.Script](https://nodejs.org/dist/latest-v6.x/docs/api/vm.html#vm_class_vm_script)
is created with the bundle as the script source, and the `produceCachedData`
option enabled. This generates `cachedData`, which should be saved on the file
system. Using both the source and `cachedData`, new
[vm.Script](https://nodejs.org/dist/latest-v6.x/docs/api/vm.html#vm_class_vm_script)
instances can be quickly created, making it much faster to load cached modules
from the bundle.

## Performance tests

```console
$ node perf-tests/create-cache-data.js

$ time node perf-tests/require-with-cached-data.js
$ time node perf-tests/raw-require.js
```
