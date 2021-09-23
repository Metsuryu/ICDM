var gulp = require('gulp');
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');



gulp.task('html', function() {
  return gulp.src('public/views/*.ejs')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

/*
gulp.task('default', function() {
  // place code for your default task here
});
*/
/*
gulp.task('ejs', function() {
  return gulp.src(['public/views/*.ejs','public/views/*.html'])
    .pipe(minifyejs())
    //.pipe(rename({suffix:".min"})) 
    .pipe(gulp.dest('dist'))
})
*/


gulp.task('css', function() {
  return gulp.src('public/css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist'));
});

//Run "gulp compress" to minify every .js file 
//in this dir, except for node_modules
gulp.task('compress', function() {
  gulp.src('public/js/*.js')
    .pipe(minify({
        ext:{
            src:'-debug.js', //Appended to copy of src files if noSource = false
            min:'.js'
        },exclude: ['node_modules','app','config'], //Exclude node_modules since it's unnecessary (they are compressed server-side).
        ignoreFiles: ['app.js'],
        noSource: true //Doesn't put a copy of the source file in the dist dir
    }))
    .pipe(gulp.dest('dist')) //Output
})