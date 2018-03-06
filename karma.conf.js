/* global process */

module.exports = function(config) {
  'use strict';

  var test_file = process.env.TEST_JS === 'min' ? 'parole.min.js' : 'parole.js';

  var configuration = {
    frameworks: ['mocha', 'chai'],
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-story-reporter'
    ],
    files: [
      test_file,
      'tests/{,**/}*-test.js'
    ],
    browsers: [ 'Chrome', 'Firefox' ],
    customLaunchers: {
      Chrome_no_sandbox: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    singleRun: true,
    reporters: ['story'],
  };

  if(process.env.TRAVIS){
    configuration.browsers = [ 'Chrome_no_sandbox', 'Firefox' ];
    configuration.concurrency = 1;
  }

  if(process.env.DRONE){
    configuration.browsers = [ 'Chrome' ];
  }

  if(process.env.WERCKER){
    configuration.browsers = [ 'Chrome' ];
  }

  config.set(configuration);
};
