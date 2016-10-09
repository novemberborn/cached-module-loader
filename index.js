'use strict'

const { join } = require('path')
const { Script } = require('vm')

exports.bundleDependencies = function (moduleId) {
  const execa = require('execa')
  return execa.stdout(
    process.execPath,
    [join(__dirname, 'bundle-dependencies.js'), moduleId],
    { encoding: 'buffer', maxBuffer: Infinity, stripEof: false }
  ).then(code => {
    const { cachedData } = new Script(code.toString('utf8'), {
      filename: `${moduleId}.bundle`,
      produceCachedData: true
    })

    return { cachedData, code, moduleId }
  })
}

exports.loadInThisContext = function (filename, parent, bundle) {
  const { cachedData, code, moduleId } = bundle
  const script = new Script(code.toString('utf8'), {
    cachedData,
    filename: `${moduleId}.bundle`
  })

  const load = script.runInThisContext()
  return load(filename, parent)
}
