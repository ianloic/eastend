/* eslint-env node */
/* eslint camelcase:0 */

var gulp = require('gulp');
var closureCompiler = require('google-closure-compiler').gulp();
var eslint = require('gulp-eslint');
var size = require('gulp-size');

gulp.task('default', function() {
    gulp.src(['src/eastend*.js', 'test/*.js', 'gulpfile.js'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());

    gulp.src('src/eastend.js')
        // Compile / minify
        .pipe(closureCompiler({
            //formatting: 'PRETTY_PRINT',
            compilation_level: 'ADVANCED',
            warning_level: 'VERBOSE',
            language_in: 'ECMASCRIPT5',
            language_out: 'ECMASCRIPT5',
            js_output_file: 'eastend.min.js'
        }))
        .pipe(size({
            pretty: false,
            showFiles: true,
            showTotal: false
        }))
        .pipe(gulp.dest('dist/'));
});
