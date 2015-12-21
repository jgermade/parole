module.exports = function(config) {
  'use strict';

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
      'dist/promise.js',
      'tests/{,**/}*.js'
    ],
    browsers: [ 'Chrome', 'Firefox' ],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    singleRun: true,
    reporters: ['story']
  };

  if(process.env.TRAVIS){
    configuration.browsers = [ 'Chrome_travis_ci', 'Firefox' ];
  }

  if(process.env.DRONE){
    configuration.browsers = [ 'Chrome' ];
  }

  if(process.env.WERCKER){
    configuration.browsers = [ 'Chrome' ];
  }

  config.set(configuration);
};
