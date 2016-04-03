var path = require('path');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var eslint = require('gulp-eslint');
var gulpsync = $.sync(gulp);
var fs = require('fs');
var replace = require('gulp-replace-task');

var karma = require('karma').server;
var protractor = require('gulp-protractor').protractor;

// production mode (see build task)
var isProduction = false;
// styles sourcemaps
var useSourceMaps = false;
var isDevelopment = false;

// MAIN PATHS
var paths = {
    public: 'public/app/',
    code: 'resources/app/'
};

// ENVIRONMENT SETTINGS
var environmentSettings = './config.json';

// VENDOR CONFIG
var vendor = {
    base: {
        source: require('./vendor.base.json'),
        dest: 'public/app/js',
        name: 'base.js'
    }
};

// SOURCES CONFIG
var source = {
    scripts: [
        paths.code + 'app.init.js',
        paths.code + 'components/**/*.js',
        paths.code + 'config/**/*.js',
        paths.code + 'directives/**/*.js',
        paths.code + 'filters/**/*.js',
        paths.code + 'services/**/*.js'
    ],
    templates: {
        index: [
            paths.code + 'index.jade'
        ],
        views: [
            paths.code + '**/*.jade',
            '!' + paths.code + 'index.jade'
        ]
    },
    styles: {
        app: [
            paths.code + 'main.scss'
        ],
        watch: [
            paths.code + '**/*.sass',
            paths.code + '**/*.scss'
        ]
    }
};

// BUILD TARGET CONFIG
var build = {
    scripts: paths.public + 'js',
    styles: paths.public + 'css',
    templates: {
        index: 'public',
        views: paths.public + 'views'
    }
};

// PLUGINS OPTIONS
var prettifyOpts = {
    indentChar: ' ',
    indentSize: 4,
    unformatted: [
        'a',
        'sub',
        'sup',
        'b',
        'i',
        'u'
    ]
};

var vendorUglifyOpts = {
    mangle: {
        except: ['$super']
    }
};

var compassOpts = {
    project: path.join(__dirname, '/'),
    css: paths.public + 'css',
    sass: paths.code,
    image: 'public/app/img'
};

// ---------------
// TASKS
// ---------------

// JS APP
gulp.task('scripts:app', function () {
    log('Building scripts..');
    return gulp.src(source.scripts)
        .pipe($.if(useSourceMaps, $.sourcemaps.init()))
        .pipe(replaceEnvironmentVars())
        .pipe(eslint({
            // Load a specific ESLint config
            config: '.eslintrc'
        }))
        .on('error', handleError)
        .pipe($.if(isDevelopment, eslint.format('stylish')))
        .on('error', handleError)
        .pipe(eslint.results(function (results) {
            $.util.log($.util.colors.magenta('Total Files with errors: ' + results.errorCount));
            $.util.log($.util.colors.yellow('Total Warnings: ' + results.warningCount));
            $.util.log($.util.colors.red('Total Errors: ' + results.errorCount));
        }))
        .on('error', handleError)
        .pipe($.if(isDevelopment, eslint.failAfterError()))
        .on('error', handleError)
        .pipe($.concat('app.js'))
        .on('error', handleError)
        .pipe($.ngAnnotate())
        .on('error', handleError)
        .pipe($.if(isProduction, $.uglify({preserveComments: 'some'})))
        .on('error', handleError)
        .pipe($.if(useSourceMaps, $.sourcemaps.write()))
        .pipe(gulp.dest(build.scripts));
});

// VENDOR BUILD
gulp.task('vendor:base', function () {
    log('Copying base vendor assets..');
    return gulp.src(vendor.base.source)
        .pipe($.expectFile(vendor.base.source))
        .pipe($.if(isProduction, $.uglify(vendorUglifyOpts)))
        .pipe($.concat(vendor.base.name))
        .pipe(gulp.dest(vendor.base.dest));
});

// APP SASS
gulp.task('styles:app', function () {
    log('Building application styles..');
    return gulp.src(source.styles.app)
        .pipe($.if(useSourceMaps, $.sourcemaps.init()))
        .pipe($.compass(compassOpts))
        .on('error', handleError)
        .pipe($.if(isProduction, $.minifyCss()))
        .pipe($.if(useSourceMaps, $.sourcemaps.write()))
        .pipe(gulp.dest(build.styles));
});

// JADE
gulp.task('templates:index', function () {
    log('Building index..');
    return gulp.src(source.templates.index)
        .pipe($.changed(build.templates.index, {extension: '.html'}))
        .pipe($.jade())
        .on('error', handleError)
        .pipe($.htmlPrettify(prettifyOpts))
        .pipe(gulp.dest(build.templates.index));
});

// JADE
gulp.task('templates:views', function () {
    log('Building views..');
    return gulp.src(source.templates.views)
        .pipe($.changed(build.templates.views, {extension: '.html'}))
        .pipe($.jade())
        .on('error', handleError)
        .pipe($.htmlPrettify(prettifyOpts))
        .pipe(gulp.dest(build.templates.views));
});

// ---------------
// WATCH
// ---------------

// Rerun the task when a file changes
gulp.task('watch', function () {
    log('Starting watch and LiveReload..');

    $.livereload.listen();

    gulp.watch(source.scripts, ['scripts:app']);
    gulp.watch(source.styles.watch, ['styles:app']);
    gulp.watch(source.templates.views, ['templates:views']);
    gulp.watch(source.templates.index, ['templates:index']);

    // a delay before triggering browser reload to ensure everything is compiled
    var livereloadDelay = 1500;
    // list of source file to watch for live reload
    var watchSource = [].concat(
        source.scripts,
        source.styles.watch,
        source.templates.views,
        source.templates.index
    );

    gulp
        .watch(watchSource)
        .on('change', function (event) {
            setTimeout(function () {
                $.livereload.changed(event.path);
            }, livereloadDelay);
        });
});

// ---------------
// TESTS TASKS
// ---------------
gulp.task('test:unit', function (done) {
    karma.start({
        configFile: path.join(__dirname, '/resources/test/karma.conf.js'),
        singleRun: true
    }, function () {
        done();
    });
});

gulp.task('test:e2e', function () {
    var args = ['--baseUrl', 'http://127.0.0.1:8888'];
    gulp.src(['./resources/test/e2e/*.js'])
        .pipe(protractor({
            configFile: 'resources/test/protractor.conf.js',
            args: args
        }))
        .on('error', function (e) {
            throw e;
        });
});

// ---------------
// MAIN TASKS
// ---------------

// build for production (minify)
gulp.task('build', gulpsync.sync([
    'prod',
    'vendor:base',
    'assets'
]));

gulp.task('prod', function () {
    log('Starting production build...');
    isProduction = true;
});

gulp.task('dev', function () {
    log('Starting development build...');
    isDevelopment = true;
});

// build with sourcemaps (no minify)
gulp.task('sourcemaps', ['usesources', 'default']);

gulp.task('usesources', function () {
    useSourceMaps = true;
});

// default (no minify)
gulp.task('default', gulpsync.sync([
    'vendor:base',
    'assets',
    'watch',
    'webserver'
]), function () {
    log('************');
    log('* All Done * You can start editing your code, LiveReload will update your browser after any change..');
    log('************');
});

gulp.task('assets', [
    'scripts:app',
    'styles:app',
    'templates:index',
    'templates:views'
]);

gulp.task('js', [
    'dev',
    'scripts:app'
]);

// gulp server
gulp.task('webserver', function () {
    $.connect.server({
        root: 'public',
        livereload: true,
        host: '127.0.0.1',
        port: 9000
    });
});

/**
 * Función para capturar errores
 * @param err
 */
function handleError(err) {
    log(err.toString());
    $.util.beep();
    this.emit('end');
}

/**
 * Función de alias del log
 * @param msg
 */
function log(msg) {
    $.util.log($.util.colors.blue(msg));
}

/**
 * Función para reemplazar las variables del código marcadas con @@
 * @returns {string}
 */
function replaceEnvironmentVars() {
    var jsonEnvSettings = JSON.parse(fs.readFileSync(path.join(__dirname, environmentSettings), 'utf8'));

    log('Set environment variables...');
    // Replace the placeholder @@dbConnection with the dbConnection from the json file.
    return replace({
        patterns: [
            {
                json: jsonEnvSettings
            }
        ]
    });
}
