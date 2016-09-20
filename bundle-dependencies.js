const bundling = new Map()
let recording = true

// Note that append-transform and its dependencies cannot be bundled.
const appendTransform = require('append-transform') // eslint-disable-line
appendTransform((code, filename) => {
  if (recording) {
    bundling.set(filename, code)
  }

  return code
})

require(process.argv[2])
recording = false

// Load further dependencies after recording the files that are to be bundled.
const Module = require('module')
const { dirname } = require('path')
const { transform } = require('babel-core')
const wrapListener = require('babel-plugin-detective/wrap-listener')
const resolveFrom = require('resolve-from')

const rewriteRequire = wrapListener((path, file) => {
  if (!path.isLiteral()) return

  const fromDir = dirname(file.opts.filename)
  const filename = resolveFrom(fromDir, path.node.value)
  if (bundling.has(filename)) {
    path.node.value = filename
  }
}, 'rewrite-require-path', {
  require: true
})

// Write a block so the script can be run in an existing context without the
// variables leaking.
process.stdout.write(`{
const files = new Map()

function load (filename, parent) {
  if (!files.has(filename)) {
    throw new Error(\`\${filename} has not been flattened\`)
  }
  if (!parent) {
    throw new TypeError('Missing parent')
  }

  const Module = parent.constructor

  const cachedModule = Module._cache[filename]
  if (cachedModule) {
    return cachedModule.exports
  }

  const module = new Module(filename, parent)
  module.filename = filename
  // FIXME: Set module.paths?

  // Add to cache early to support circular references.
  Module._cache[filename] = module

  let threw = true
  try {
    const { dirname, compiledWrapper } = files.get(filename)
    const require = makeRequireFunction(module)
    const args = [module.exports, require, module, filename, dirname]
    compiledWrapper.apply(module.exports, args)
    threw = false
  } finally {
    if (threw) {
      delete Module._cache[filename]
    }
  }

  return module.exports
}

function makeRequireFunction(module) {
  const Module = module.constructor

  function require (path) {
    if (files.has(path)) {
      return load(path, module)
    }

    return module.require(path)
  }

  function resolve (request) {
    return Module._resolveFilename(request, module)
  }
  require.resolve = resolve

  require.main = process.mainModule
  require.extensions = Module._extensions
  require.cache = Module._cache

  return require
}\n\n`)

for (const [filename, originalCode] of bundling) {
  const { code } = transform(originalCode, {
    filename,
    code: true,
    ast: false,
    babelrc: false,
    compact: false,
    plugins: [rewriteRequire]
  })

  // Add the module wrapper, but ignore the trailing semicolon.
  const wrapped = Module.wrap(code).slice(0, -1)

  process.stdout.write(`files.set(${JSON.stringify(filename)}, {
dirname: ${JSON.stringify(dirname(filename))},
compiledWrapper: ${wrapped}
})\n\n`)
}

process.stdout.write('load\n}\n')
