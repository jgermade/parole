
require('nitro')(function (nitro) {

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

  nitro.task('gh-release', function () {
    nitro.github.release( 'v' + require('./package').version, {
      branch: 'master'
    });
  });

}).run();
