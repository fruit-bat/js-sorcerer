var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProjectDist = ts.createProject("tsconfig.json");
var tsProjectDocs = ts.createProject("tsconfig_docs.json");
var serve = require('gulp-serve');
var browserSync = require('browser-sync');
var livereload = require('gulp-livereload');
var targetDocs = 'docs';
var targetDist = 'dist';

gulp.task('copy', function(done) {
  gulp.src(['**/*.html'], {cwd: 'src'})
   .pipe(gulp.dest(targetDocs));

  gulp.src(['**/*'], {cwd: 'assets'})
   .pipe(gulp.dest(targetDocs));

//  gulp.src(['**/*.js'], {cwd: 'src'})
//    .pipe(gulp.dest(target));

  done();
});

gulp.task("tsify-docs", function () {
    return tsProjectDocs.src()
        .pipe(tsProjectDocs())
        .js.pipe(gulp.dest(targetDocs));
});

gulp.task("tsify-dist", function () {
    return tsProjectDist.src()
        .pipe(tsProjectDist())
        .js.pipe(gulp.dest(targetDist));
});

gulp.task("build-dist", gulp.parallel('tsify-dist'));

gulp.task("build-docs", gulp.parallel('copy', 'tsify-docs'));

gulp.task("build", gulp.parallel('build-dist', 'build-docs'));

gulp.task("default", gulp.series("build"));

gulp.task('watch', function () {
   gulp.watch(
   ['src/**/*', 'assets/**/*', 'tsconfig_docs.tson', 'gulpfile.js'],
   gulp.series('build-docs'));
});

var reload = browserSync.reload;

// watch files for changes and reload
gulp.task('serve', gulp.parallel('watch', function() {
  livereload.listen(1234);

  browserSync({
    server: {
      baseDir: targetDocs,
    },
   port: 8080
  });

  gulp.watch(['**/*'], {cwd: targetDocs}, reload);
}));
