'use strict'

const Diff = require('../src/Diff');

const left = {
  foo: 'Foo',
  bar: 123,
  bla: {
    blub: 'Blubb',
    nope: undefined
  }
}

const right = Object.assign({
  foo: 'Bar'
}, left)

const diff = new Diff()
diff.jsonDiff(left, right).print()
