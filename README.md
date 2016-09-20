# cached-module-loader

Highly experimental bundler and loader of Node.js modules.

**Don't use this.**

## Usage ;-)

```js
const cml = require('cached-module-loader')

cml.bundleDependencies('babel-core').then(bundle => {
  const babel = cml.load(require.resolve('babel-core'), module, bundle)
  // And now use babel!
})
```

## Performance Tests

Clone the repo, then:

```sh
npm install
node perf-tests/create-cache-data.js

time perf-tests/require-with-cached-data.js
time perf-tests/raw-require.js
```
