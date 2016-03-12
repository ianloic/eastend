var gulp = require('gulp');
var closureCompiler = require('google-closure-compiler').gulp();
var eslint = require('gulp-eslint');


gulp.task('default', function() {
    gulp.src(['src/eastend*.js', 'test/*.js'])
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
        // Compile / minify to ES5
        .pipe(closureCompiler({
            compilation_level: 'ADVANCED',
            warning_level: 'VERBOSE',
            language_in: 'ECMASCRIPT5',
            language_out: 'ECMASCRIPT5',
            js_output_file: 'eastend.min.js'
        })).pipe(gulp.dest('dist/'));

    gulp.src('src/eastend-worker.js')
        // Compile / minify to ES5
        .pipe(closureCompiler({
            compilation_level: 'ADVANCED',
            warning_level: 'VERBOSE',
            language_in: 'ECMASCRIPT5',
            language_out: 'ECMASCRIPT5',
            js_output_file: 'eastend-worker.min.js'
        })).pipe(gulp.dest('dist/'));
});
