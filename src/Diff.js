'use strict'

const TypeInspect = require('type-inspect')
const jsdiff = require('diff')
const cf = require('colorfy')

class Diff {
  constructor () {

  }

  jsonDiff (left, right) {
    const l = 
    if (typeof left !== 'object' || typeof right !== 'object') {
      this.inputError = [typeof left, typeof right]

      return this
    }
  }

  print () {

  }
}

module.exports = Diff
