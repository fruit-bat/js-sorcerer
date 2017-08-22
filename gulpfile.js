var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var serve = require('gulp-serve');
var browserSync = require('browser-sync');
var livereload = require('gulp-livereload');
var target = 'docs';

gulp.task('copy', function() {
  gulp.src(['**/*.html'], {cwd: 'src'})
   .pipe(gulp.dest(target));

  gulp.src(['**/*'], {cwd: 'assets'})
   .pipe(gulp.dest(target));

   gulp.src(['**/*.js'], {cwd: 'src'})
    .pipe(gulp.dest(target));
});

gulp.task("tsify", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(target));
});

gulp.task("build", ['copy', 'tsify']);

gulp.task("default", ["build"]);

gulp.task('watch', function () {
   gulp.watch(['src/**/*', 'assets/**/*', 'tsconfig.tson', 'gulpfile.js'], ['build']);
});

var reload = browserSync.reload;

// watch files for changes and reload
gulp.task('serve', ['watch'], function() {
  livereload.listen(1234);

  browserSync({
    server: {
      baseDir: target,
    },
   port: 8080
  });

  gulp.watch(['**/*'], {cwd: target}, reload);
});
