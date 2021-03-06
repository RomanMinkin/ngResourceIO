"use strict";

/**
 * End-to-end testing config
 * http://karma-runner.github.io/0.10/config/configuration-file.html
 */
module.exports = function(config) {
    config.set({

        /* base path, that will be used to resolve files and exclude */
        basePath: './',

        /*
         *  The base url, where Karma runs.
         *  All the Karma's urls get prefixed with the urlRoot.
         *  This is helpful when using proxies,
         *  as sometimes you might want to proxy a url that is already taken by Karma.
         */
        urlRoot: '/e2e/',

        /* List of frameworks you want to use. Typically, you will set this to ['jasmine'], ['mocha'] or ['qunit'] */
        // frameworks: ['ng-scenario'],
        frameworks: ['mocha'],

        /* list of files / patterns to load in the browser */
        files: [
            /* need to load libs including current versions of jquery and angular*/
            'test/libs/jquery.js',
            'test/libs/angular.js',
            'node_modules/ng-midway-tester/src/ngMidwayTester.js',
            'node_modules/should/should.js',
            // 'test/libs/socket.io.js',


            'http://localhost:3000/_serveDev/system?ts=1',
            'http://localhost:3000/_serveDev/code/app/entry.js?ts=1&pathPrefix=app',
            'http://localhost:3000/_serveDev/start?ts=1389475575268',

            /* load cource code itself */
            'src/**/*.js',

            'test/libs/angular-mocks.js',
            'test/e2e/socketstream/**/*.e2e.js',

            /* load client unit tests */
            // 'test/unit/**/*.spec.js'
            // 'test/libs/angular-mocks.js',
            // 'test/e2e/**/*.e2e.js',
            // 'test/e2e/socketstream/**/*.e2e.js',
            // 'test/e2e/common/**/*.e2e.js',
        ],

        /* list of files to exclude */
        exclude: [],

        /*
         *  Enable or disable watching files and executing the tests whenever one of these files changes.
         *  CLI: --auto-watch, --no-auto-watch
         */
        autoWatch: true,

        /*
         *  report which specs are slower than 500ms
         *  CLI: --report-slower-than 500
         */
        // reportSlowerThan: 1000,

        /*
         *  If browser does not capture in given timeout [ms], kill it
         *  CLI: --capture-timeout 5000
         */
        captureTimeout: 20000,

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
        browsers: [process.env.TRAVIS ? 'PhantomJS' : 'Chrome'],

        /*
         *  use dots reporter, as travis terminal does not support escaping sequences
         *  possible values: 'dots', 'progress'
         *  CLI --reporters progress
         *  reporters: ['dots', 'progress', 'junit'],
         */
        reporters: ['progress'],

        /*
         *  Auto run tests on start (when browsers are captured) and exit
         *  CLI --single-run --no-single-run
         */
        singleRun: false,

        plugins: [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            // 'karma-jasmine',
            'karma-mocha',
            // 'karma-ng-scenario'
        ],

        /*
         *  level of logging
         *  possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
         *  CLI --log-level debug
         */
        logLevel: config.LOG_INFO,

        /*
         *  enable / disable colors in the output (reporters and logs)
         *  CLI --colors --no-colors
         */
        colors: true,

        junitReporter: {
            outputFile: 'test_out/e2e.xml',
            suite: 'e2e'
        }
    });
};