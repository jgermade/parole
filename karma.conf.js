/* global process */

module.exports = function(config) {

  var test_file = process.env.TEST_JS === 'min' ? 'dist/parole.min.js' : 'dist/parole.umd.js'

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
    browsers: [ 'ChromeHeadless', 'FirefoxHeadless' ],
    customLaunchers: {
      Chrome_no_sandbox: {
        base: 'Chrome',
        flags: ['--no-sandbox'],
      },
    },
    singleRun: true,
    reporters: ['story'],
  }

  if( process.env.TRAVIS ) {
    configuration.browsers = [ 'Chrome_no_sandbox', 'Firefox' ]
    configuration.concurrency = 1
  }

  if( process.env.DRONE ) {
    configuration.browsers = [ 'Chrome' ]
  }

  if(process.env.WERCKER){
    configuration.browsers = [ 'Chrome' ]
  }

  config.set(configuration)
}
