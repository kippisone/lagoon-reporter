'use strict'

const PrettyInspect = require('../src/utils/PrettyInspect');

const fixtures = [
  [ 'Object', {} ],
  [ 'Array', [] ]
]

fixtures.forEach((item) => {
  console.log(`${item[0]} ----------------------------`)
  console.log(PrettyInspect.inspect(item[1]))
  console.log(PrettyInspect.inspect(item[1]).toString())
  console.log('')
  console.log('')
})
