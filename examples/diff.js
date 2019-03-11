const stringDiff = require('../').stringDiff
const diff = require('../').diff

const tests = [
  [ 'Diff two booleans', true, false ],
  [ 'Diff two strings', 'I like bananas', 'I like pineapples' ],
  [ 'Diff two strings', 'I like bananas', 'I like\npineapples  ' ],
  [ 'Diff two numbers', 123, 456 ],
  [ 'Diff two objects', { foo: 'foo', bar: 'bar' }, { foo: 'foo', bar: 'bla' } ],
  [ 'Diff two nested objects', { foo: 'foo', bar: 'bar', bla: { one: 1, two: 2, three: 3 } }, { foo: 'foo', bar: 'bla', bla: { one: 1, three: 3, four: 4, two: 2 } } ],
  [ 'Diff two arrays', [ 'foo', 'bar' ], [ 'foo', 'bla' ] ]
]

tests.forEach((item) => {
  console.log(item[0], '\n') // eslint-disable-line no-console
  console.log(stringDiff(item[1], item[2]), '\n') // eslint-disable-line no-console
})

tests.forEach((item) => {
  console.log(item[0], '\n') // eslint-disable-line no-console
  console.log(diff(item[1], item[2]), '\n') // eslint-disable-line no-console
})
