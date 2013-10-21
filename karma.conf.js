"use strict";

/**
 * End-to-end testing config
 * http://karma-runner.github.io/0.10/config/configuration-file.html
 */
module.exports = function(config) {
    config.set({

        /* base path, that will be used to resolve files and exclude */
        basePath: '../',

        /* List of frameworks you want to use. Typically, you will set this to ['jasmine'], ['mocha'] or ['qunit'] */
        frameworks: ['jasmine'],

        /* list of files / patterns to load in the browser */
        files: [
            /* need to load libs including current versions of jquery and angular*/
            'client/code/libs/**/*.js',

            /* need to load angular and project moks */
            'test/libs/mocks/*.js',
            'test/libs/angular/*.js',

            /* load cource code itself */
            'client/code/app/**/*.js',

            /* load clietn unit tests */
            'test/unit/client/**/*.spec.js'
        ],

        /* list of files to exclude */
        exclude: [
            'client/code/app/entry.js'
        ],


        /*
         *  use dots reporter, as travis terminal does not support escaping sequences
         *  possible values: 'dots', 'progress'
         *  CLI --reporters progress
         *  reporters: ['progress', 'junit'],
         */
        reporters: ['progress', ],

        /*  The port where the webserver will be listening.
         * CLI --port 9876
         */
        port: 9018,

        /*
         *  enable / disable colors in the output (reporters and logs)
         *  CLI --colors --no-colors
         */
        colors: true,

        /*
         *  level of logging
         *  possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
         *  CLI --log-level debug
         */
        logLevel: config.LOG_INFO,

        /*
         *  Enable or disable watching files and executing the tests whenever one of these files changes.
         *  CLI: --auto-watch, --no-auto-watch
         */
        autoWatch: true,

        /*
         *  Start these browsers, currently available:
         *  - Chrome
         *  - ChromeCanary
         *  - Firefox
         *  - Opera
         *  - Safari (only Mac)
         *  - PhantomJS
         *  - IE (only Windows)
         *  CLI --browsers Chrome,Firefox,Safari
         *  browsers: [process.env.TRAVIS ? 'Firefox' : 'Firefox'],
         */
        browsers: [process.env.TRAVIS ? 'Firefox' : 'PhantomJS'],

        /*
         *  If browser does not capture in given timeout [ms], kill it
         *  CLI: --capture-timeout 5000
         */
        captureTimeout: 20000,

        /*
         *  Auto run tests on start (when browsers are captured) and exit
         *  CLI --single-run --no-single-run
         */
        singleRun: false,

        /*
         *  report which specs are slower than 500ms
         *  CLI: --report-slower-than 500
         */
        reportSlowerThan: 500,

        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher'
            // 'karma-junit-reporter',
            // 'karma-commonjs'
        ]
    });
};