'use strict'

const TypeInspector = require('type-inspector')

// 🅾🅰🅽🆄🅸🅽🆂
// ➊➋➌➍➎➏➐➑➒➓⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴

const TYPESET = {
  'object': '🅾',
  'null': '🅾',
  'array': '🅰',
  'string': '🆂',
  'number': '🅽',
  'undefined': '🆄',
  'unknown': '?'
}

class PrettyInspect {
  static inspect (val) {
    const ts = new TypeInspector({
      toString: this.prettify
    })

    const inspected = ts.inspect(val)
    return inspected
  }

  static getDataType (inspected) {
    console.log('VAL', inspected)
    return `${ts} ${inspected.toString()}`
  }

  static prettify () {
    const ts = TYPESET[this.subType] || TYPESET.unknown

    if (this.type === 'object') {
      if (this.subType === 'null') {
        return `${ts}null`
      }

      if (this.subType === 'array') {
        return `${ts}[${this.value.type ? this.value.toString() : ''}]`
      }

      return `${ts}{${this.value.type ? this.value.toString() : ''}}`

    }

    return `${ts} ${this.value.toString()}`
  }
}

module.exports = PrettyInspect
