const sass = require('gulp-sass')(require('sass'));
const gulp = require('gulp');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var browserify = require('browserify');
const fs = require('fs');

function buildScss(cb) {
  console.log("build scss");
  return gulp.src('./scss/app.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./dist'));
}

function buildVendorScripts(){
  return gulp.src([
    './js/vendor/vue.global.js',
    './js/vendor/vue-i18n.global.js',
    './js/vendor/axios.min.js',
    './js/vendor/simplemde.min.js',
    './js/vendor/marked.min.js'])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./dist'));
}

function buildScripts(){
  console.log("build js");

  return browserify()
  .add('./js/index.js')
  .bundle()
  .pipe(fs.createWriteStream('./dist/bundle.js'));

}

function watchFiles(cb) {
  console.log("watch");
  watch('./scss/**/*.scss', function(){
    gulp.series(buildScss)();
  });

  watch('./js/**/*.js', function(){
    try {
        gulp.series(buildScripts, buildVendorScripts)();
    } catch (error) {
        console.log(error);
    }
  });
}

gulp.series(buildScss, buildScripts, buildVendorScripts,  watchFiles)();