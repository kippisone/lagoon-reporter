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
  let timeStr;

  if (t < 1e3) {
    timeStr = t + 'ns';
  }
  else if (t < 1e6) {
    timeStr = Math.floor(t / 1e3) + 'μs';
  }
  else if (t < 1e9) {
    timeStr = Math.floor(t / 1e6) + 'ms';
  }
  else {
    timeStr = Math.floor(t / 1e9) + 's';
  }

  return {
    time: t,
    toString: () => timeStr
  };
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
    let duration = process.hrtime(testStart);
    duration = humanize(duration);

    ++passed;
    let log = cf(indent() + ' ').green('✔').llgrey(test.fullTitle());

    log.grey('(', 'rtrim');

    if (duration.time < 1e6) {
      log.green(duration);
    }
    else if (duration.time > 4.9e6) {
      log.red(duration);
    }
    else if (duration.time > 1e7) {
      log.orange(duration);
    }
    else {
      log.lime(duration);
    }

    log.grey(')', 'ltrim');
    log.print();
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
