'use strict';

require('nitro')(function (nitro) {

  nitro.task('build', function () {

    nitro.load('lib/promise-q.js')
      .process('browserify', {
        plugins: [nitro.require('babelify')]
      })
      .writeFile('dist/promise.js')
      .process('uglify')
      .writeFile('dist/promise.min.js');

  });

}).run();
