'use strict';

let cf = require('colorfy');
let jsdiff = require('diff');
let fluf = require('fluf');
let superstorage = require('superstorage');

let indention = 0;

let stringDiff = function(actual, expected) {
  let str = cf();

  if (typeof actual === 'object' && actual !== null) {
    actual = JSON.stringify(actual, null, '  ');
  }

  if (typeof expected === 'object' && expected !== null) {
    expected = JSON.stringify(expected, null, '  ');
  }

  let left = fluf(String(actual)).split();
  let right = fluf(String(expected)).split();

  let indentLeft = Math.max(left.longestItem(), 20);
  let indentRight = Math.max(right.longestItem(), 20);

  str.red('actual:', 'trim').txt(' '.repeat(indentLeft - 5), 'trim');
  str.green('expected:', 'trim').txt(' '.repeat(indentRight - 7), 'trim').nl();
  str.grey('-'.repeat(indentLeft), 'trim').txt('  ', 'trim');
  str.grey('-'.repeat(indentRight), 'trim').nl(2);

  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    let diff = jsdiff.diffChars(left.get(i, ''), right.get(i, ''));
    let lineLength = 0;
    diff.forEach(part => {
      if (part.removed) {
        str.red(part.value, 'trim');
        lineLength += part.value.length;
      }
      else if (!part.added) {
        str.txt(part.value, 'trim');
        lineLength += part.value.length;
      }
    });

    str.txt(' '.repeat(indentLeft - lineLength + 2), 'trim')

    diff.forEach(part => {
      if (part.added) {
        str.green(part.value, 'trim');
        lineLength += part.value.length;
      }
      else if (!part.removed) {
        str.txt(part.value, 'trim');
        lineLength += part.value.length;
      }
    });

    str.nl();
  }

  return str;
}

let oneToMultiDiff = function(actual, expected) {
  let str = cf();

  actual = actual.map(item => {
    if (typeof item === 'object' && item !== null) {
      item = JSON.stringify(item, null, '  ').replace(/\\"/g, '"');
    }

    return item;
  });

  if (typeof expected === 'object' && expected !== null) {
    expected = JSON.stringify(expected, null, '  ').replace(/\\"/g, '"');
  }

  str.green('expected:', 'trim').nl();
  str.grey('-'.repeat(80)).txt('  ', 'trim').nl();
  str.txt(expected).nl(2);

  str.red('actual:', 'trim').nl();
  str.grey('-'.repeat(80)).txt('  ', 'trim').nl();

  actual.forEach(call => {
    let diff = jsdiff.diffWords(expected, call);
      diff.forEach(part => {
        if (part.removed) {
          str.red(part.value, 'trim');
        }
        else if (part.added) {
          str.green(part.value, 'trim');
        }
        else {
          str.txt(part.value, 'trim');
        }
      });

      str.nl(2);
  });

  return str;
}

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

let highlightErrorMessage = function(err)  {
  let msg = fluf(err.stack || err.message || String(err)).split();
  let str = cf();

  let errorMsg = msg.__items.shift();
  str.red(errorMsg).txt('\n');
  msg.forEach(line => {
    if (/^\s*at/.test(line)) {
      line = line.split(/\((.+)\)$/).forEach(match => {
        if (/(\.spec\.js)|((Test|Spec)\.js)$/.test(match)) {
          return str.grey('(').lime(match, 'trim').grey(')');
        }

        return str.grey(match);
      });
    }

    str.grey(line).txt('\n');
  });

  return str;
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
    highlightErrorMessage(err).print();

    let diffStr;
    if (err.diffMode) {
      if (err.diffMode === 'one-to-n') {
        diffStr = oneToMultiDiff(err.actual, err.expected).colorfy();
      }
    }
    else if (err.hasOwnProperty('actual') && err.hasOwnProperty('expected')) {
      diffStr = stringDiff(err.actual, err.expected).colorfy();
    }

    if (diffStr) {
      console.log(fluf(diffStr).indent(' ', indention + 6), '\n'); // eslint-disable-line
    }
  });

  runner.on('test', function(test) {
    testStart = process.hrtime();
  });

  runner.on('end', function() {
    let runtime = process.hrtime(suiteStart);
    let str = cf();
    let sharedState = superstorage('inspectjs-shared-state');

    str.lgrey('\n \u2702' + ' –'.repeat(33))
      .txt('\n')
      .green('   ' + passed).grey(pluralize(passed, 'test passed\n', 'tests passed\n'))
      .red('   ' + failed).grey(pluralize(failed, 'test failed\n', 'tests failed\n'))
      .azure('   ' + skiped).grey(pluralize(skiped, 'test skipped\n', 'tests skipped\n\n'));

    if (sharedState.has('counter')) {
      str.lime('   ' + sharedState.get('counter')).grey('inspections\n');
      sharedState.set('counter', 0);
    }

    str.llgrey('\n   All tests have been done in').green(humanize(runtime))
      .txt('\n\n')
      .print();

    process.exit(failed);
  });
}

module.exports = LagoonReporter;
