'use strict';

let inspect = require('inspect.js');

describe('String diff', function() {
  it('Shows a string diff', function() {
    inspect('This is a string').isEql('This is another string');
  });
});
