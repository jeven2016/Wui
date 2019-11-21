var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var fs = require('fs');
var gulp = require('gulp');
var console = require('better-console');
var sass = require('gulp-sass');
var path = require('path');
var del = require('del');

sass.compiler = require('node-sass');

// plugins
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var header = require('gulp-header');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sassGlob = require('gulp-sass-glob');

var buildElemsConfig = require('./config/build-elements');

var global = {
  name: 'wui-modern.css',
  dist: 'dist/',
  header: [
    '@charset "UTF-8";\n',
    '/*!',
    ' * <%= name %> -<%= homepage %>',
    ' * Version - <%= version %>',
    ' * Licensed under the MIT license - http://opensource.org/licenses/MIT',
    ' * Copyright (c) <%= new Date().getFullYear() %> <%= author.name %>',
    ' */\n',
  ].join('\n'),
};

var scssDirs = {
  base: {
    path: 'src/base/',
    file: ['_base-index.scss']
  },
  common: {
    path: 'src/base/',
    file: ['_elements-common-index.scss']
  },
  elems: {
    path: 'src/base/elements',
    config: buildElemsConfig
  }
};

function solveFileName(file) {
  return file.startsWith("/") ? path.substring(1, file.length) : file;
}

function invalidFile(file) {
  throw new Error("The file is invalid: " + file);
}

function getFileName(file) {
  if (typeof file === 'string') {
    return solveFileName(file);
  }

  if (Array.isArray(file)) {
    if (file.length === 0) {
      invalidFile(file)
    }
    return solveFileName(file[0]);
  }
  invalidFile(file);
}

function getFiles(dirConfig) {
  if (!dirConfig) {
    console.log("The config is ignored.");
    return [];
  }
  if (!dirConfig.hasOwnProperty("path")) {
    console.error("No path variable defined in your config");
    return [];
  }

  if (dirConfig.hasOwnProperty("file")) {
    var dirPath = dirConfig.path;
    dirPath = dirPath.endsWith("/") ? dirPath : dirPath.concat("/");
    var file = [dirPath + getFileName(dirConfig.file)];
    return file;
  }

  var elemConfig = dirConfig.config;
  var fileList = [];
  fs.readdirSync(dirConfig.path).forEach(function (fileName) {
    if (!fileName.endsWith(".scss")) {
      console.log("The directory is ignored:" + fileName);
      return;
    }

    if (!elemConfig) {
      fileList.push(dirConfig.path + "/" + fileName);
      return;
    }

    var pureName = fileName.replace("_", "").replace(".scss", "");
    if (elemConfig.elements[pureName]) {
      fileList.push(dirConfig.path + "/" + fileName);
    } else {
      console.warn("The file (" + fileName
          + ") is ignored because it isn't enabled in config file.");
    }
  });
  //parse multiple files
  return fileList;
}

gulp.task('clean', function () {
  console.log("cleaning the dist directory...");
  return del([global.dist + "**"]);
});

gulp.task('addDefaultHeader', function () {
  return gulp.src('dist/default/*.css').pipe(header(global.banner)).pipe(
      gulp.dest(global.dist + "default2"));
});

gulp.task('buildDefault', function () {
  var scssFiles = getFiles(scssDirs.base)
  .concat(getFiles(scssDirs.common))
  .concat(getFiles(scssDirs.elems));

  console.info("The following files will be compiled:");
  console.info(scssFiles);

  return gulp.src(scssFiles).pipe(sassGlob()).pipe(concat(global.name))
  .pipe(sass.sync().on('error', sass.logError)).pipe(
      gulp.dest(global.dist + "default"))
      // .pipe(postcss([autoprefixer("prefix")]))
      .pipe(gulp.dest(global.dist+"default"))
      .pipe(postcss([cssnano({reduceIdents: {keyframes: false}})]))
      .pipe(rename(".min"))
      .pipe(gulp.dest(global.dist+"default"));

});

gulp.task('default', gulp.series('clean', 'buildDefault', 'addDefaultHeader'));