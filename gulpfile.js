var gulp = require('gulp')
  , bower = require('gulp-bower')
  , cssmin = require('gulp-minify-css')
  , uglify = require('gulp-uglify')
  , del = require('del')
  , exec = require('child_process').exec
  ;

gulp.task('bower', function() {
  console.log('Installing bower');
  return bower().pipe(gulp.dest('./public/vendor'));
});

gulp.task('watch', [], function() {
  return gulp.watch([ './public/stylesheets', '/public/javascripts' ], [ 'default' ]);
});

gulp.task('css', [], function() {
  del([ './public/build/stylesheets/**' ]);
  return gulp.src('./public/stylesheets/*.css')
    .pipe(cssmin())
    .pipe(gulp.dest('./public/build/stylesheets'));
});

gulp.task('js', [], function() {
  del([ './public/build/javascripts/**' ]);
  return gulp.src('./public/javascripts/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./public/build/javascripts'));
});

gulp.task('default', [ 'watch' ], function() {
  console.log('Starting configs');
  gulp.start('css', 'js');
  exec('node app.js');
});
