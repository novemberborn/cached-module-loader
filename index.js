const { join } = require('path')
const { Script } = require('vm')

exports.bundleDependencies = function (mid) {
  const execa = require('execa')
  return execa.stdout(
    process.execPath,
    [join(__dirname, 'bundle-dependencies.js'), mid],
    { encoding: 'buffer', maxBuffer: Infinity, stripEof: false }
  ).then(code => {
    const { cachedData } = new Script(code.toString('utf8'), {
      filename: `${mid}.bundle`,
      produceCachedData: true
    })

    return { cachedData, code, mid }
  })
}

exports.loadInThisContext = function (filename, parent, bundle) {
  const { cachedData, code, mid } = bundle
  const script = new Script(code.toString('utf8'), {
    cachedData,
    filename: `${mid}.bundle`
  })

  const load = script.runInThisContext()
  return load(filename, parent)
}
