'use strict'

const TypeInspector = require('type-inspector')

const TYPESET = {
  'object': 'o',
  'unknown': '?'
}

class PrettyInspect {
  static inspect (val) {
    const ts = new TypeInspector({
      toString: this.prettify
    })
    const inspected = ts.inspect(val)
    return this.getDataType(inspected)
  }

  static getDataType (inspected) {
    const ts = TYPESET[inspected.subType] || TYPESET.unknown
    return `${ts} ${inspected.toString()}`
  }

  static loop (obj) {
    if (obj.type === 'object' && obj.subType === 'null') {
      return this.getDataType()
    }

    if (obj.type === 'object' && obj.subType === 'array') {

    }

  static prettify (val) {
    const inspected = this.getDataType(val)

  }
}

module.exports = PrettyInspect
