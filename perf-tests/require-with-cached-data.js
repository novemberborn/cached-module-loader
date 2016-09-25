const { strictEqual } = require('assert')
const { readFile } = require('fs')
const { join } = require('path')

const { loadInThisContext } = require('../')

function read (file) {
  return new Promise((resolve, reject) => {
    return readFile(file, (err, contents) => {
      if (err) reject(err)
      else resolve(contents)
    })
  })
}

Promise.all([
  read(join(__dirname, '.cached-data.bin')),
  read(join(__dirname, '.cached-code.js'))
]).then(([cachedData, code]) => {
  const babel = loadInThisContext(require.resolve('babel-core'), module, {
    mid: 'babel-core',
    cachedData,
    code
  })

  strictEqual(require('babel-core'), babel)
  return
}).catch(err => {
  console.error(err && err.stack || err)
  process.exit(1)
})
