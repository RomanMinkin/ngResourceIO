/*jshint loopfunc:true, node:true */
"use strict";

process.env.TEST_MODE = true;

module.exports = function(grunt) {

    var exec      = require('faithful-exec'), // Helpers for custom tasks, mainly around promises / exec
        os        = require('os'),
        fs        = require('fs.extra'),
        async     = require('async'),
        util      = require('util'),
        path      = require('path'),
        shjs      = require('shelljs'),
        browsers  = grunt.option('browsers') ? grunt.option('browsers').split(',') : ['PhantomJS'],
        ss,
        io;

    /* Filter all grunt-* dependencies, excluding grunt-cli (multiple matching patterns) */
    require('matchdep').filterDev(['grunt-*','!grunt-cli']).forEach(grunt.loadNpmTasks);

    // Project configuration.
    grunt.initConfig({
        dirs: {
            'build'                : 'build',
            'test'                 : 'test',
            'bowerComponents'      : 'bower_components',
            'test_libs'            : '<%= dirs.test %>/libs',
            'jquery'               : '<%= dirs.test_libs %>',
            'angular'              : '<%= dirs.test_libs %>',
            'angular-route'        : '<%= dirs.test_libs %>',
            "angular-mocks"        : '<%= dirs.test_libs %>',
            'app_socketstream'     : '<%= dirs.test %>/apps/socketstream',
            'app_socketstream_libs': '<%= dirs.app_socketstream %>/client/code/libs',
            'app_socketio'         : '<%= dirs.test %>/apps/socket.io',
            'app_socketio_libs'    : '<%= dirs.app_socketio %>/static'
        },
        pkg: grunt.file.readJSON('bower.json'),
        buildtag: '-dev-' + grunt.template.today('yyyy-mm-dd'),
        meta: {
            banner: [
                '/*!\n',
                ' * <%= pkg.description %>\n',
                ' *\n',
                ' * @version v<%= pkg.version %><%= buildtag %>\n',
                ' * @link <%= pkg.homepage %>\n',
                ' * @author <%= pkg.author %>\n',
                ' * @license MIT License, https://raw.github.com/RomanMinkin/ngResourceIO/master/LICENSE\n',
                ' */',
            ].join('')
        },
        clean: {
            bowerComponents: ['<%= dirs.bowerComponents %>'],
            testLibs       : ['<%= dirs.test_libs %>/*'],
            links          : ['<%= dirs.app_socketstream_libs %>/*'],
            build          : ['<%= dirs.build %>']
        },
        build: {
            dest: '<%= dirs.build %>/<%= pkg.name %>.js'
        },
        concat: {
            options: {
                stripBanners: true,
                separator: ';',
                banner: '<%= meta.banner %>\n'
            },
            build: {
                src: ['src/*.js'],
                dest: '<%= dirs.build %>/<%= pkg.name %>.js'
            },
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>\n'
            },
            main: {
                files: {
                    '<%= dirs.build %>/<%= pkg.name %>.min.js': ['<%= dirs.build %>/<%= pkg.name %>.js']
                }
            }
        },
        copy: {
            release: {
                src  : '<%= dirs.build %>/',
                files: ['<%= pkg.name %>.js', '<%= pkg.name %>.min.js'],
                dest : 'release/'
            }
        },
        jshint: {
            server: {
                options: grunt.util._.merge(grunt.file.readJSON('.jshintrc'),
                    {}
                ),
                files: {
                    src: [
                        '*.js',
                        '<%= dirs.app_socketstream %>/*.js',
                        '<%= dirs.app_socketstream %>/server/**/*.js',
                        '<%= dirs.app_socketio%>/*.js',
                    ]
                }
            },
            client: {
                options: grunt.util._.merge(
                    grunt.file.readJSON('.jshintrc'),
                    {
                        browser     : true,
                        node        : false,
                        ignores: [
                            '<%= dirs.test_libs %>/**',
                            '<%= dirs.app_socketstream_libs %>/**',
                            '<%= dirs.app_socketstream %>/node_modules/**',
                            '<%= dirs.app_socketstream %>/server/**',
                            '<%= dirs.app_socketstream %>/**',
                            '<%= dirs.app_socketio_libs%>/**',
                            '<%= dirs.app_socketio%>/**',
                        ]
                    }
                ),
                files: {
                    src: [
                        '<%= dirs.build %>',
                        'src/**/*.js',
                        'test/**/*.js'
                    ]
                }
            }
        },
        jsonlint: {
            all: {
                src: [
                    '*.json',
                    'src/**/*.json',
                    'test/**/*.json'
                ]
            }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    base: 'test/apps/static/'
                }
            }
        },
        jasmine: {
            src: 'src/**/*.js',
            options: {
                specs: 'test/spec/**/*.js',
                host : 'http://127.0.0.1:3000/'
            }
        },
        monitor: {
            options: {
                atBegin  : true,
                interrupt: true,
                debounceDelay: 1000,
            },
            lint: {
                files: ['src/**/*.js', 'test/**/*.js'],
                tasks: ['lint']
            },
            unit: {
                files: ['src/**/*.js', 'test/unit/**/*.js'],
                tasks: ['concat', 'karma:unitBackground:run']
            },
            e2eSocketStream: {
                files: ['src/**/*.js', 'test/e2e/**/*.js'],
                tasks: ['concat', 'karma:e2eSocketStreamBackground:run']
            },
            e2eSocketIO: {
                files: ['src/**/*.js'],
                tasks: ['concat', 'karma:e2eSocketIOBackground:run']
            }
        },
        karma: {
            options: {
                hostname: os.hostname(),
                configFile: './karma.conf.js',
            },
            unit: {
                singleRun: true,
                browsers: browsers
            },
            unitBackground: {
                background: true,
                browsers: browsers
            },
            e2eSocketStream: {
                singleRun: true,
                options: {
                    configFile: './karma-e2e.conf.js',
                    proxies: {
                        '/': 'http://localhost:9000/'
                    }
                },
                browsers: browsers
            },
            e2eSocketStreamBackground: {
                background: true,
                options: {
                    configFile: './karma-e2e.conf.js',
                    proxies: {
                        '/': 'http://localhost:9000/'
                    }
                },
                browsers: browsers
            },
            e2eSocketIO: {
                singleRun: true,
                options: {
                    configFile: './karma-e2e.conf.js',
                    files: [
                    'node_modules/ng-midway-tester/src/ngMidwayTester.js',
                        'test/e2e/socket.io/**/*.e2e.js',
                        'test/e2e/common/**/*.e2e.js',
                    ],
                    proxies: {
                        '/': 'http://localhost:3001/'
                    }
                },
                browsers: browsers
            },
            e2eSocketIOBackground: {
                background: true,
                options: {
                    configFile: './karma-e2e.conf.js',
                    files: [
                        'test/e2e/socket.io/**/*.e2e.js',
                        'test/e2e/common/**/*.e2e.js',
                    ],
                    proxies: {
                        '/': 'http://localhost:3001/'
                    }
                },
                browsers: browsers
            }
        },
        symlink: {
            libs: {
                files: [
                    {
                        expand: true,
                        cwd: path.join('<%= dirs.test_libs %>'),
                        src: ['*.js'],
                        dest: '<%= dirs.app_socketstream_libs %>',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: path.join('<%= dirs.test_libs %>'),
                        src: ['*.js'],
                        dest: '<%= dirs.app_socketio_libs %>',
                        filter: 'isFile'
                    }
                ]
            },
            'angular-resource-io': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= dirs.build %>',
                        src: ['*.js'],
                        dest: '<%= dirs.app_socketstream_libs %>',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= dirs.build %>',
                        src: ['*.js'],
                        dest: '<%= dirs.app_socketio_libs %>',
                        filter: 'isFile'
                    }
                ]
            }
        }
    });

    /**
     * Rename our watch task to 'monitor', then make actual 'watch'
     * task build things, then start test server
     */
    grunt.renameTask('watch', 'monitor');

    grunt.registerTask('default',                                                ['lint', 'test']);
    grunt.registerTask('build',                                                  ['clean:build', 'concat', 'uglify']);
    grunt.registerTask('install',                                                ['install:modules:socketstream', 'clean:links', 'symlink:libs']);

    /* Dev pre-test tasks */
    grunt.registerTask('dev:install',                                            ['clean:cache', 'bower', 'install:modules:socketstream', 'clean:links', 'symlink:libs']);
    grunt.registerTask('dev:update:libs',                                        ['bower', 'clean:links', 'symlink:libs']);

    /* Lint tasks */
    grunt.registerTask('lint', 'Runs both jshint and jsonlint',                   ['jsonlint', 'jshint']);

    /* Test tasks */
    grunt.registerTask('test', 'Runs all the test once',                         ['test:unit', 'test:socketstream'/*, 'test:socket.io'*/]);
    grunt.registerTask('test:unit', 'Runs unit tests once',                      ['karma:unit']);
    grunt.registerTask('test:socketstream', 'Single run end-to-end tests for SocketStream App', ['start:socketstream', 'karma:e2eSocketStream']);
    grunt.registerTask('test:socket.io', 'Single run end-to-end tests for Socket.io App', ['start:socket.io', 'karma:e2eSocketIO']);

    /* Watch tasks */
    grunt.registerTask('watch:lint', 'Run and watch for lint',                    ['monitor:lint']);
    grunt.registerTask('watch:test:unit', 'Run and watch for unit',               ['karma:unitBackground', 'delay', 'monitor:unit']);
    grunt.registerTask('watch:test:unit', 'Run and watch for unit',               ['karma:unitBackground', 'delay', 'monitor:unit']);
    grunt.registerTask('watch:test:socketstream', 'Run end-to-end tests and watching changes for SocketStream App', ['start:socketstream', 'karma:e2eSocketStreamBackground', 'delay', 'monitor:e2eSocketStream']);
    grunt.registerTask('watch:test:socket.io', 'Run end-to-end tests and watching changes for Socket.io App', ['start:socket.io', 'karma:e2eSocketIOBackground', 'delay', 'monitor:e2eSocketIO']);

    grunt.registerTask('clean:cache', 'Clean node modules cache', function() {
        clearCache();
    });

    /* release build tasks */
    grunt.registerTask('release', 'Tag and perform a release', ['prepare-release', 'build', 'perform-release']);

    /* bower */
    grunt.registerTask('bower', 'Download client libraries from Bower repository and copy them across the project', ['clean:bowerComponents', 'bower-install', 'clean:testLibs', 'bower-copy', 'clean:bowerComponents']);


    /* Helper tasks */
    grunt.registerTask('build-socket.io-client', 'Run SocketStream test server for the test porpuse', function() {
        var done     = this.async(),
            target   = 'node_modules/socket.io/node_modules/socket.io-client',
            file     = 'socket.io.js',
            build    = util.format('node %s/bin/builder.js', target),
            copyFrom = path.join(target, 'dist', file),
            copyTo   = path.join(grunt.config.get('dirs.test_libs'), file);

        shjs.exec(build);

        fs.copy(copyFrom, copyTo, function(err) {
            grunt.log.write('Coping "' + copyTo + '"...');
            if (err) {
                done(err);

            } else {
                grunt.log.writeln("Ok".green);
                done();
            }
        });
    });

    grunt.registerTask('start:socketstream', 'Run SocketStream test server for the test porpuse', function() {
        var done         = this.async(),
            app_path     = grunt.config.get('dirs.app_socketstream'),
            start_script = 'app.js',
            cmd          = util.format('cd %s && node %s', app_path, start_script);

        if (ss) {
            ss = null;
        }

        ss = shjs.exec(cmd, {async:true});

        done();
    });

    grunt.registerTask('start:socket.io', 'Run Socket.io/Express test server for the test porpuse', function() {
        var done         = this.async(),
            app_path     = grunt.config.get('dirs.app_socketio'),
            start_script = 'app.js',
            cmd          = util.format('cd %s && node %s', app_path, start_script);

        if (io) {
            io = null;
        }

        io = shjs.exec(cmd, {async:true});

        done();
    });

    grunt.registerTask('install:modules:socketstream', 'instal SocketStream framework for 2e2 tests', function() {
        var app_path = grunt.config.get('dirs.app_socketstream'),
            pwd      = __dirname,
            done = this.async();

            fs.rmrfSync( path.join(app_path, 'node_modules') );
            process.chdir(app_path);

            system('npm install').then(function() {
                process.chdir(pwd);
                done();
            });
    });

    grunt.registerTask('wait', 'test for wating, it should never call done()', function() {
        var done = this.async();
        done = null;
    });

    grunt.registerTask('bower-install', 'Execute Bower installer from node_modules/bower/bin', function() {
        var done = this.async();
        system('./node_modules/bower/bin/bower install').then(done);
    });

    grunt.registerTask('bower-copy', 'Execute Bower installer from node_modules/bower/bin', function() {
        var done           = this.async(),
            bower          = grunt.file.readJSON('bower.json'),
            dependencies   = grunt.util._.merge(bower.dependencies, bower.devDependencies),
            copyStack      = [],
            _module,
            _bower,
            _path,
            _main;

        for (_module in dependencies) {
            if (bower.dependencies.hasOwnProperty(_module)) {
                _path = path.join(grunt.config.get('dirs.bowerComponents'), _module);
                _bower = grunt.file.readJSON( path.join(_path, '.bower.json') );
                _main = _bower.main || _bower.scripts;

                switch(_module){
                    case 'jquery':
                        /* bower_components/jquery/jquery.js */
                        // console.log(_module, path.join(_path, _main[0]));

                        copyStack.push( [path.join(_path, _main[0]), path.join(grunt.config.get('dirs.jquery'), _main[0])] );

                    break;

                    case 'angular':
                        /* bower_components/angular/angular.js */
                        // console.log(_module, path.join(_path, _main));
                        copyStack.push( [path.join(_path, _main), path.join(grunt.config.get('dirs.angular'), _main)] );
                    break;

                    case 'angular-route':
                        /* bower_components/angular-route/angular-route.js */
                        // console.log(_module, path.join(_path, _main));
                        copyStack.push( [path.join(_path, _main), path.join(grunt.config.get('dirs.angular-route'), _main)] );
                    break;

                    case 'angular-mocks':
                        /* bower_components/angular-mocks/angular-mocks.js */
                        // console.log(_module, path.join(_path, _main));
                        copyStack.push( [path.join(_path, _main), path.join(grunt.config.get('dirs.angular-mocks'), _main)] );
                    break;
                }
            }
        }

        async.map(copyStack, function(files, cb){
            fs.copy(files[0], files[1], function(err) {
                grunt.log.write('Coping "' + files[1] + '"...');
                if (err) {
                    cb(err);

                } else {
                    grunt.log.writeln("Ok".green);
                    cb(null, true);
                }
            });
        }, function(err, result){
            if (err) {
                grunt.log.error(err);
            } else {
                grunt.log.ok('Copied ' + result.length + ' files.');
            }
            done(err);
        });

    });

    grunt.registerTask('delay', 'set process delay fro 2000ms, can be overwritten in CLI by --delay 1000 ', function() {
        var done = this.async();
        setTimeout(done, grunt.option('delay') || 2000);
    });

    grunt.registerTask('prepare-release', function() {
        var bower = grunt.file.readJSON('bower.json'),
            version = bower.version;
        if (version !== grunt.config('pkg.version')) {
            throw 'Version mismatch in bower.json';
        }

        promising(this,
            ensureCleanMaster().then(function() {
            return exec('git tag -l \'' + version + '\'');
        }).then(function(result) {
            if (result.stdout.trim() !== '') {
                throw 'Tag \'' + version + '\' already exists';
            }
            grunt.config('buildtag', '');
            grunt.config('dirs.build', 'release');
        }));
    });

    grunt.registerTask('perform-release', function() {
        grunt.task.requires(['prepare-release', 'dist']);

        var version = grunt.config('pkg.version'),
            releasedir = grunt.config('dirs.build');
        promising(this,
            system('git add \'' + releasedir + '\'').then(function() {
            return system('git commit -m \'release ' + version + '\'');
        }).then(function() {
            return system('git tag \'' + version + '\'');
        }));
    });


    function system(cmd) {
        grunt.log.write('% ' + cmd + '\n');
        return exec(cmd).then(function(result) {
            grunt.log.write(result.stderr + result.stdout);
        }, function(error) {
            grunt.log.write(error.stderr + '\n');
            throw 'Failed to run \'' + cmd + '\'';
        });
    }

    function promising(task, promise) {
        var done = task.async();
        promise.then(function() {
            done();
        }, function(error) {
            grunt.log.write(error + '\n');
            done(false);
        });
    }

    function ensureCleanMaster() {
        return exec('git symbolic-ref HEAD').then(function(result) {
            if (result.stdout.trim() !== 'refs/heads/master') {
                throw 'Not on master branch, aborting';
            }
            return exec('git status --porcelain');
        }).then(function(result) {
            if (result.stdout.trim() !== '') {
                throw 'Working copy is dirty, aborting';
            }
        });
    }

    function clearCache() {
        for (var key in require.cache) {
            if (key.indexOf(__dirname + '/node_modules/') === -1) {
                delete require.cache[key];
            }
        }
    }

    /**
     * Kills SocketStream's application, if exists ('ss')
     * @return {Void}
     */
    function killApps() {
        if (ss && ss.kill && typeof ss.kill === 'function') {
            process.kill(ss.pid+1); // killing the SocketStream's sub-child process 'node app.js'
            process.kill(ss.pid);   // killing the SocketStream's child process 'cd ...'
        }
        if (io && io.kill && typeof io.kill === 'function') {
            process.kill(io.pid+1); // killing the SocketStream's sub-child process 'node app.js'
            process.kill(io.pid);   // killing the SocketStream's child process 'cd ...'
        }
    }

    process.on('exit', function() {
        killApps();
    });
};