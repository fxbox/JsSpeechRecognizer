const gulp = require('gulp');
const rollup = require('gulp-rollup');

const TEST_FILE = 'test/test.keywordspotting.js';

gulp.task('rollup-test', () => {
  return gulp
    .src('test/**/*.js')
    .pipe(rollup({
      entry: TEST_FILE,
    }))
    .pipe(
      gulp.dest('test/dist')
    );
});

gulp.task('copy-html', () => {
  return gulp
    .src([
      'test/*.html',
    ])
    .pipe(gulp.dest('test/dist'));
});

gulp.task('copy-wavs', () => {
  return gulp
    .src([
      'test/resources/*.wav',
    ])
    .pipe(gulp.dest('test/dist/resources'));
});

gulp.task('watch', () => {
  gulp.watch(['test/**'], ['build-test']);
});

gulp.task('build-test', ['rollup-test', 'copy-html', 'copy-wavs']);
