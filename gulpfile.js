var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var serve = require('gulp-serve');
var browserSync = require('browser-sync');
var livereload = require('gulp-livereload');
var target = 'docs';

gulp.task('copy', function(done) {
  gulp.src(['**/*.html'], {cwd: 'src'})
   .pipe(gulp.dest(target));

  gulp.src(['**/*'], {cwd: 'assets'})
   .pipe(gulp.dest(target));

  gulp.src(['**/*.js'], {cwd: 'src'})
    .pipe(gulp.dest(target));
    
  done();
});

gulp.task("tsify", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(target));
});

gulp.task("build", gulp.parallel('copy', 'tsify'));

gulp.task("default", gulp.series("build"));

gulp.task('watch', function () {
   gulp.watch(
   ['src/**/*', 'assets/**/*', 'tsconfig.tson', 'gulpfile.js'], 
   gulp.series('build'));
});

var reload = browserSync.reload;

// watch files for changes and reload
gulp.task('serve', gulp.parallel('watch', function() {
  livereload.listen(1234);

  browserSync({
    server: {
      baseDir: target,
    },
   port: 8080
  });

  gulp.watch(['**/*'], {cwd: target}, reload);
}));
