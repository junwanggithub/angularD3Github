var config  = require('../config')
var ghPages = require('gulp-gh-pages')
var gulp    = require('gulp')
var open    = require('open')
var os      = require('os')
var package = require('../../package.json')
var path    = require('path')

var settings = {
  url: package.homepage,
  src: path.join(config.root.dest, '/**/*'),
  ghPages: {
    cacheDir: path.join(os.tmpdir(), package.name),
    remoteUrl: 'https://518d6895d1f29721097e49ec66c248e2e516ae6a@github.com/junwanggithub/angularD3Github.git'
  }
}

var deployTask = function() {
  return gulp.src(settings.src)
    .pipe(ghPages(settings.ghPages))
    .on('end', function(){
      open(settings.url)
    })
}

gulp.task('deploy', ['production'], deployTask)
module.exports = deployTask
