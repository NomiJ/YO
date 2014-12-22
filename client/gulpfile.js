var gulp = require('gulp'),
    gutil = require('gulp-util'),
    bower = require('bower'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    sh = require('shelljs'),
    uglify = require('gulp-uglifyjs'),
    server = require('gulp-develop-server');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['./www/js/**/*.js']
};

gulp.task('default', ['sass', 'compress', 'run-server', 'run-ionic', 'watch']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('compress', function(done) {
  gulp.src(paths.js)
      .pipe(uglify('app.js',{
        mangle:false,
        output: {
          beautify: true
        }
      }))
      .pipe(gulp.dest('./www/lib/'))
      .pipe(uglify('app.min.js',{
        mangle:false
      }))
      .pipe(gulp.dest('./www/lib/'))
      .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['compress']);
  gulp.watch(['../server/**/*.js','!../server/node_modules/**/*'], server.restart);
});

gulp.task('run-ionic', function(done) {
  if(!sh.which('ionic')){
    console.log('  ' + gutil.colors.red('Ionic is not installed.'))
  }else{
    sh.exec('ionic serve', function(code, output) {
      console.log('Exit code:', code);
      console.log('Ionic output:', output);
    });
    done();
  }
});

gulp.task('run-server', function(done) {
  server.listen( { path: '../server/server.js' } );
  done()
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
