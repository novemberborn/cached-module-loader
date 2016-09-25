'use strict'

const { writeFileSync } = require('fs')
const { join } = require('path')

const { bundleDependencies } = require('../')

bundleDependencies('babel-core').then(({ cachedData, code }) => {
  writeFileSync(join(__dirname, '.cached-data.bin'), cachedData)
  writeFileSync(join(__dirname, '.cached-code.js'), code)
  return
}).catch(err => {
  console.error(err && err.stack || err)
  process.exit(1)
})
