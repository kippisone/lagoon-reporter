'use strict';

let cf = require('colorfy');
let jsdiff = require('diff');
let fluf = require('fluf');

let indention = 0;

let stringDiff = function(actual, expected) {
  let diff = [];
  let str = cf();

  // if (typeof actual === 'object') {
  //   actual = JSON.stringify(actual, null, '  ');
  // }
  //
  // if (typeof expected === 'object') {
  //   expected = JSON.stringify(expected, null, '  ');
  // }

  // if (typeof actual === 'string') {
  //     actual = actual.replace(/\n/g, '↵');
  // }

  // if (typeof expected === 'string') {
  //     expected = expected.replace(/\n/g, '↵');
  // }

  if (typeof actual === 'object' && typeof expected === 'object') {
    str.txt('current object', 'bgred').txt('expected object', 'bgazure').nl(2);
    diff = jsdiff.diffChars(JSON.stringify(actual, null, '  '), JSON.stringify(expected, null, '  '));

    diff.forEach(function(part) {
      let color = part.added ? 'bgred' :
          part.removed ? 'bgazure' : '';

      part.value.split('\n').forEach(function(l) {
        str.txt(l, color).nl();
      });
    });

    return str;
  }

  // if (typeof actual === 'string' && typeof expected === 'string') {
  //     str = colorLeft('current string') + ' ' + colorRight('expected string') + '\n\n';
  //     diff = jsdiff.diffLines(actual, expected);
  // }

  // if (typeof actual === 'number' && typeof expected === 'number') {
  //     str = colorLeft('current number: ' + actual) + ' ' + colorRight('expected number: ' + expected) + '\n\n';
  // }

  // if (!noDiff) {
  //     diff.forEach(function(line) {
  //         let color = line.added ? colorRight :
  //             line.removed ? colorLeft : clc.whiteBright;

  //         str += line.value.split('\n').map(function(l) {
  //             return color(l) + '\n';
  //         }).join('\n');
  //     });
  // }

  let left = fluf(String(actual)).split();
  let right = fluf(String(expected)).split();

  let indentLeft = left.longestItem();

  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    let strLeft = cf();

    let diff = jsdiff.diffChars(left.get(i, ''), right.get(i, ''));
    let lineLength = 0;
    diff.forEach(part => {
      if (part.removed) {
        str.green(part.value, 'trim');
        lineLength += part.value.length;
      }
      else if (!part.added) {
        str.txt(part.value, 'trim');
        lineLength += part.value.length;
      }
    });

    str.txt(' '.repeat(indentLeft - lineLength + 2))

    diff.forEach(part => {
      if (part.added) {
        str.red(part.value, 'trim');
        lineLength += part.value.length;
      }
      else if (!part.removed) {
        str.txt(part.value, 'trim');
        lineLength += part.value.length;
      }
    });
  }

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
    if (err.hasOwnProperty('actual') && err.hasOwnProperty('expected')) {
      let diffStr = stringDiff(err.actual, err.expected).colorfy();
      console.log(fluf(diffStr).indent(' ', indention + 6)); // eslint-disable-line
    }
  });

  runner.on('test', function(test, err) {
    testStart = process.hrtime();
  });


  runner.on('end', function() {
    let runtime = process.hrtime(suiteStart);

    cf().lgrey('\n \u2702' + ' –'.repeat(33))
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
