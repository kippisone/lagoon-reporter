'use strict';

let inspect = require('inspect.js');

describe('Lagoon reporter', function() {
  describe('Test run', function() {
    it('Should pass a test', function() {
      inspect(true).isTrue();
    });

    it('Should fail a test', function() {
      inspect(false).isTrue();
    });

    it('Should pass as well', function() {
      inspect(false).isFalse();
    });

    it.skip('Should be skipped', function() {
      inspect('skip').isString();
    });
  });
});

describe('String diff', function() {
  it('Shows a string diff', function() {
    inspect('This is a string').isEql('This is another string');
  });

  it('Shows a json diff', function() {
    inspect({
      foo: 'bar',
      bar: 'bla'
    }).isEql({
      foo: 'bla',
      bar: 'foo'
    });
  });
});
