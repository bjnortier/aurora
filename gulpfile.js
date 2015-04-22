
var gulp = require('gulp');
var path = require('path');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var webpack = require('gulp-webpack-build');

var indexFile = 'index.js';
var srcFiles = path.join('lib', '**', '*.js');
var unitTestFiles = path.join('test', 'unit', '**', '*.js');
var functionalTestFiles = path.join('test', 'functional', 'src', '**', '*.js');

gulp.task('clearconsole', function() {
  process.stdout.write('\x1Bc');
});

gulp.task('jshint', function() {
  return gulp.src([indexFile, srcFiles, unitTestFiles, functionalTestFiles])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', function() {
  return gulp.src([indexFile, srcFiles, unitTestFiles, functionalTestFiles])
    .pipe(jscs());
});

gulp.task('unit', function() {
  return gulp.src(unitTestFiles)
    .pipe(mocha({}));
});

var webpackOptions = {
  debug: true,
};
var webpackConfig = {};
var CONFIG_FILENAME = webpack.config.CONFIG_FILENAME;

gulp.task('webpack', [], function() {
  return gulp.src(path.join(CONFIG_FILENAME))
    .pipe(webpack.configure(webpackConfig))
    .pipe(webpack.overrides(webpackOptions))
    .pipe(webpack.compile())
    .pipe(webpack.format({
      version: false,
      timings: true
    }))
    .pipe(webpack.failAfter({
      errors: true,
      warnings: true
    }));
});

gulp.task('test', ['jshint', 'jscs', 'unit', 'webpack']);

gulp.task('default', ['test']);

gulp.task('watch', function() {
  gulp.watch([indexFile, srcFiles], ['clearconsole', 'jshint', 'jscs', 'unit', 'webpack']);
  gulp.watch(unitTestFiles, ['clearconsole', 'jshint', 'jscs', 'unit']);
  gulp.watch(functionalTestFiles, ['clearconsole', 'jshint', 'jscs', 'webpack']);
});


