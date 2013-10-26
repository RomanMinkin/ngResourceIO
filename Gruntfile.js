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
        ss;

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-symlink');
    grunt.loadNpmTasks('grunt-karma');

    // Project configuration.
    grunt.initConfig({
        builddir: 'build',
        testdir : 'test',
        dirs: {
            'test'                 : 'test',
            'bowerComponents'      : 'bower_components',
            'test_libs'            : '<%= dirs.test %>/libs',
            'jquery'               : '<%= dirs.test_libs %>',
            'angular'              : '<%= dirs.test_libs %>',
            'angular-route'        : '<%= dirs.test_libs %>',
            'app_socketstream'     : 'test/apps/socketstream',
            'app_socketstream_libs': '<%= dirs.app_socketstream %>/client/code/libs'
        },
        pkg: grunt.file.readJSON('package.json'),
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
            testLibs           : ['<%= dirs.test_libs %>/*'],
            links          : ['<%= dirs.app_socketstream_libs %>/*'],
            build          : ['<%= builddir %>']
        },
        build: {
            dest: '<%= builddir %>/<%= pkg.name %>.js'
        },
        concat: {
            options: {
                stripBanners: true,
                separator: ';',
                banner: '<%= meta.banner %>\n'
            },
            dist: {
                src: ['src/*.js'],
                dest: '<%= builddir %>/<%= pkg.name %>.js'
            },
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>\n'
            },
            build: {
                files: {
                    '<%= builddir %>/<%= pkg.name %>.min.js': ['<banner:meta.banner>', '<%= build.dest %>']
                }
            }
        },
        release: {
            files: ['<%= pkg.name %>.js', '<%= pkg.name %>.min.js'],
            src  : '<%= builddir %>',
            dest : 'release'
        },
        jshint: {
            server: {
                options: grunt.util._.merge({}, grunt.file.readJSON('.jshintrc')),
                files: {
                    src: [
                        '*.js',
                    ]
                }
            },
            client: {
                options: grunt.util._.merge({
                    browser     : true,
                    node        : false,
                    ignores: [
                        '<%= dirs.test_libs %>/**',
                        '<%= dirs.app_socketstream_libs %>/**',
                        '<%= dirs.app_socketstream %>/node_modules/**',
                    ]
                }, grunt.file.readJSON('.jshintrc')),
                files: {
                    src: [
                        'src/**/*.js',
                        'test/**/*.js'
                    ]
                }
            }
        },
        monitor: {
            options: {
                atBegin  : true,
                interrupt: true
            },
            server: {
                files: ['*.js', 'server/**/*.js'],
                tasks: ['start:server', 'wait'],

            },
            testServer: {
                files: ['test/**/*.js', '*.js', 'server/**/*.js'],
                tasks: ['nodeunit:all'],

            },
            testServerRoot: {
                files: ['test/**/*.js', '*.js', 'server/*.js'],
                tasks: ['nodeunit:root'],

            },
            testServerModels: {
                files: ['test/unit/server/models/**/*.js', 'server/**/*.js'],
                tasks: ['nodeunit:models']
            },
            testServerControllers: {
                files: ['test/unit/server/controllers/**/*.js', 'server/**/*.js'],
                tasks: ['nodeunit:controllers']
            },
            testServerPrc: {
                files: ['test/unit/server/rpc/**/*.js', 'server/**/*.js'],
                tasks: ['nodeunit:rpc']
            },
            testClient: {
                files: ['client/code/**/*.js', 'test/unit/client/**/*.spec.js'],
                tasks: ['karma:unitBackground:run']
            },
            e2eSocketStream: {
                files: ['src/*.js'],
                tasks: ['karma:e2eSocketStream:run']
            }
        },
        connect: {
            server: {}
        },
        karma: {
            options: {
                hostname: os.hostname(),
                configFile: './configs/karma.conf.js',
            },
            unit: {
                singleRun: true,
                browsers: [grunt.option('browser') || 'PhantomJS' || 'Firefox' || 'Chrome']
            },
            e2eSocketStream: {
                singleRun: false,
                options: {
                    configFile: './karma-e2e.conf.js',
                    proxies: {
                        '/': 'http://localhost:3000/'
                    }
                }
            },
            e2eSocketStreamBackground: {
                background: true,
                options: {
                    configFile: './karma-e2e.conf.js',
                    proxies: {
                        '/': 'http://localhost:3000/'
                    }
                }
            },
            unitBackground: {
                background: true,
                browsers: [grunt.option('browser') || 'PhantomJS']
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
                    }
                ]
            },
            ngResourceIO: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['*.js'],
                        dest: '<%= dirs.app_socketstream_libs %>',
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

    grunt.registerTask('default',                                                 ['jshint']);

    /* Dev pre-test tasks */
    grunt.registerTask('dev:install',                                            ['clean:cache', 'bower', 'install:modules:socketstream', 'clean:links', 'symlink:libs']);
    grunt.registerTask('dev:update:libs',                                        ['bower', 'clean:links', 'symlink:libs']);

    /* Test tasks */
    // grunt.registerTask('test',                                                    []);
    grunt.registerTask('test:socketstream',                                     ['start:socketstream', 'karma:e2eSocketStream']);

    /* Watch tasks */
    grunt.registerTask('watch:test:socketstream', 'Run end-to-end tests and watching changes',                    ['start:socketstream', 'karma:e2eSocketStreamBackground', 'monitor:e2eSocketStream']);

    grunt.registerTask('clean:cache', 'Clean node modules cache', function() {
        clearCache();
    });

    /* release build tasks */
    // grunt.registerTask('release', 'Tag and perform a release', ['prepare-release', 'dist', 'perform-release']);
    // grunt.registerTask('dev', 'Run dev server and watch for changes', ['build', 'connect', 'karma:unitBackground', 'watch']);

    /* bower */
    grunt.registerTask('bower', 'Download client liblalies from Bower repository and copy them across the project', ['clean:bowerComponents', 'bower-install', 'clean:testLibs', 'bower-copy', 'clean:bowerComponents']);


    /* Helper tasks */
    grunt.registerTask('start:socketstream', 'Run dev server once, uses for test porpuse', function() {
        var done         = this.async(),
            app_path     = grunt.config.get('dirs.app_socketstream'),
            start_script = 'app.js',
            cmd          = util.format('cd  %s && node %s', app_path, start_script);

        if (ss) {
            ss = null;
        }

        ss = shjs.exec(cmd, {async:true});

        setTimeout(done, 0);
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
            copyStack      = [],
            _module,
            _bower,
            _path,
            _main;

        for (_module in bower.dependencies) {
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

                    // case 'angular-mocks':
                    //     /* bower_components/angular-mocks/angular-mocks.js */
                    //     // console.log(_module, path.join(_path, _main));
                    //     copyStack.push( [path.join(_path, _main), path.join(grunt.config.get('dirs.angular-mocks'), _main)] );
                    // break;
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

    grunt.registerTask('delay', 'test for wating, it should never call done()', function() {
        var done = this.async();
        setTimeout(done, 2000);
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
            grunt.config('builddir', 'release');
        }));
    });

    grunt.registerTask('perform-release', function() {
        grunt.task.requires(['prepare-release', 'dist']);

        var version = grunt.config('pkg.version'),
            releasedir = grunt.config('builddir');
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
};