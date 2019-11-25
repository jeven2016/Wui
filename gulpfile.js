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
var header = require('gulp-header');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sassGlob = require('gulp-sass-glob');
var merge = require('merge-stream');
var wait = require('gulp-wait');

var buildElemsConfig = require('./config/build-elements');
var pkg = require('./package.json');

var global = {
  name: 'wui-modern',
  dist: 'dist/',
  banner: [
    '/*!',
    ' * <%= pkg.name %> -<%= pkg.homepage %>',
    ' * Version - <%= pkg.version %>',
    ' * Licensed under the MIT license - http://opensource.org/licenses/MIT',
    ' * Copyright (c) <%= new Date().getFullYear() %> <%= pkg.author %>',
    ' */\n',
  ].join('\n'),
};

var scssDirs = {
  variableFile: '_variables.scss',
  base: {
    path: 'src/',
    file: ['_normalize.scss', '_variables.scss', '_base-index.scss'],
  },
  common: {
    path: 'src/',
    file: ['_elements-common-index.scss'],
  },
  elems: {
    path: 'src/elements',
    config: buildElemsConfig,
  },
  themes: {
    path: 'src/themes',
  },
};

function solveFileName(file) {
  return file.startsWith('/') ? path.substring(1, file.length) : file;
}

function invalidFile(file) {
  throw new Error('The file is invalid: ' + file);
}

function getFileNames(prefix, file) {
  if (typeof file === 'string') {
    return solveFileName(file);
  }

  if (Array.isArray(file)) {
    if (file.length === 0) {
      invalidFile(file);
    }
    return file.map(function(item) { return prefix + item;});
  }
  invalidFile(file);
}

function getFiles(dirConfig) {
  if (!dirConfig) {
    console.log('The config is ignored.');
    return [];
  }
  if (!dirConfig.hasOwnProperty('path')) {
    console.error('No path variable defined in your config');
    return [];
  }

  if (dirConfig.hasOwnProperty('file')) {
    var dirPath = dirConfig.path;
    dirPath = dirPath.endsWith('/') ? dirPath : dirPath.concat('/');
    var files = getFileNames(dirPath, dirConfig.file);
    return files;
  }

  var elemConfig = dirConfig.config;
  var fileList = [];
  fs.readdirSync(dirConfig.path).forEach(function(fileName) {
    if (!fileName.endsWith('.scss')) {
      console.log('The directory is ignored:' + fileName);
      return;
    }

    if (!elemConfig) {
      fileList.push(dirConfig.path + '/' + fileName);
      return;
    }

    var pureName = fileName.replace('_', '').replace('.scss', '');
    if (!elemConfig.elements.hasOwnProperty(pureName)) {
      console.warn('The file (' + fileName
          + ') is ignored because it isn\'t enabled in config file.');
    }
    var enabled = elemConfig.elements[pureName];
    if (enabled) {
      fileList.push(dirConfig.path + '/' + fileName);
    }
  });
  //parse multiple files
  return fileList;
}

gulp.task('clean', function() {
  console.log('cleaning the dist directory...');
  return del([global.dist + '**']);
});

gulp.task('addDefaultHeader', function() {
  return gulp.src('dist/default/*.css').
      pipe(header(global.banner, {pkg: pkg})).
      pipe(gulp.dest(global.dist + 'default'));
});

gulp.task('buildDefault', function() {
  console.info('>>>>  Begin to compile the default theme................');
  var scssFiles = getFiles(scssDirs.base).
      concat(getFiles(scssDirs.common)).
      concat(getFiles(scssDirs.elems));

  console.info('The following files will be compiled:');
  console.info(scssFiles);

  return gulp.src(scssFiles).
      pipe(sassGlob()).
      pipe(concat(global.name + '-' + pkg.version + '.css')).
      pipe(sass.sync().on('error', sass.logError)).
      pipe(gulp.dest(global.dist + 'default')).
      pipe(postcss([cssnano({reduceIdents: {keyframes: false}})])).
      pipe(rename(global.name + '-' + pkg.version + '.min.css')).
      pipe(gulp.dest(global.dist + 'default'));

});

function getFolders(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

gulp.task('buildThemes', function() {
  console.info('>>>>  Begin to compile themes................');
  var tskArray = getFolders(scssDirs.themes.path).map(function(dirName) {
    var variableFile = path.join(scssDirs.themes.path, dirName,
        scssDirs.variableFile).toString();

    var scssFiles = getFiles(scssDirs.base).
        concat(variableFile).
        concat(getFiles(scssDirs.common)).
        concat(getFiles(scssDirs.elems));

    console.info('The following files will be compiled:');
    console.info(scssFiles);

    return gulp.src(scssFiles).
        pipe(wait(500)).
        pipe(sassGlob()).
        pipe(concat(global.name + '-' + pkg.version + '.css')).
        pipe(sass.sync().on('error', sass.logError)).
        pipe(gulp.dest(global.dist + dirName)).
        pipe(postcss([cssnano({reduceIdents: {keyframes: false}})])).
        pipe(rename(global.name + '-' + pkg.version + '.min.css')).
        pipe(gulp.dest(global.dist + dirName));
  });

  return merge(tskArray);
});

gulp.task('default',
    gulp.series('clean', 'buildDefault'));