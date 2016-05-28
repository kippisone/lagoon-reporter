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
