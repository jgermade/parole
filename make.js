'use strict';

require('nitro')(function (nitro) {

  nitro.task('lint', function () {

    nitro.load('lib/{,**/}*.js').process('eslint');

  });

  nitro.task('build', function () {

    nitro.load('lib/promise-browser.js')
      .process('browserify', {
        plugins: [nitro.require('babelify')]
      })
      .writeFile('dist/promise.js')
      .process('uglify')
      .writeFile('dist/promise.min.js');

  });

  var pkgActions = {
    increaseVersion: function () {
      nitro.package('bower').setVersion( nitro.package('npm').increaseVersion().version() );
    }
  };

  nitro.task('pkg', function (target) {
    if( pkgActions[target] ) {
      return pkgActions[target]();
    }

    var pkg = require('./package');
    process.stdout.write(pkg[target]);
    process.exit(0);
  });

}).run();
