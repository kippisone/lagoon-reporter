'use strict';

let cf = require('colorfy');

let indention = 0;
let indent = function(str) {
  if (str === undefined) {
    return ' '.repeat(indention * 2);
  }

  if (typeof str !== 'string') {
    str = String(str);
  }

  return str
    .split(/\n/g)
    .map(line => {
      return ' '.repeat(indention * 2) + line
    })
    .join('\n');
};

let pluralize = function(num, sing, plur) {
  if (num && num === 1) {
    return sing;
  }

  return plur;
}

let humanize = function(hrtime) {
  let t = hrtime[0] * 1e9 + hrtime[1];
  if (t < 1e3) {
    return t + 'ns';
  }

  if (t < 1e6) {
    return Math.floor(t / 1e3) + 'μs';
  }

  if (t < 1e9) {
    return Math.floor(t / 1e6) + 'ms';
  }

  return Math.floor(t / 1e9) + 's';
}

function LagoonReporter(runner) {
  let passed = 0;
  let failed = 0;
  let skiped = 0;
  let testStart;
  let suiteStart;

  runner.on('start', () => {
    cf(indent()).grey('Start test runner').print();
    suiteStart = process.hrtime();
  });

  runner.on('suite', function(suite) {
    if (!suite.title) {
      return;
    }

    ++indention;
    cf(indent('›')).azure(suite.title, 'bold').print()
  });

  runner.on('suite end', function() {
    --indention;
      // process.sdtout.print('\n')
  });

  runner.on('pass', function(test) {
    ++passed;
    cf(indent() + ' ').green('✔').llgrey(test.fullTitle()).print();
  });

  runner.on('pending', function(test) {
    ++skiped;
    cf(indent() + ' ').azure('⚡').ddgrey(test.fullTitle()).print();
  });

  runner.on('fail', function(test, err) {
    ++failed;
    cf(indent() + ' ').red('✘').grey(test.fullTitle()).txt('\n').print();
    cf(indent() + '   ').lgrey(err.message).print();
  });

  runner.on('test', function(test, err) {
    testStart = process.hrtime();
  });


  runner.on('end', function() {
    let runtime = process.hrtime(suiteStart);

    cf().lgrey('\n ✀' + ' –'.repeat(33))
      .txt('\n')
      .green('   ' + passed).grey(pluralize(passed, 'test passed\n', 'tests passed\n'))
      .red('   ' + failed).grey(pluralize(failed, 'test failed\n', 'tests failed\n'))
      .azure('   ' + skiped).grey(pluralize(skiped, 'test skipped\n', 'tests skipped\n'))
      .llgrey('\n   All tests have been done in').green(humanize(runtime))
      .txt('\n\n')
      .print();

    process.exit(failed);
  });
}

module.exports = LagoonReporter;
