var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var fs = require('fs');
var gulp = require('gulp');

var sass = require('gulp-sass');
sass.compiler = require('node-sass');

// plugins
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var header = require('gulp-header');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');

var buildElemsConfig = require('./config/build-elements');

var scssDirs = {
  base: {
    path: './src/base/',
    file: ['_base-index.scss']
  },
  common: {
    path: './src/elements/common',
    file: ['_common-index.scss']
  }
  //todo
};

gulp.task('getBuildConfig', function () {
  console.log("hello")
  return gulp.src("./config/build-elements.js");
});

gulp.task('default', gulp.series('getBuildConfig'));