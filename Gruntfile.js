/*jshint loopfunc:true */

process.env.TEST_MODE = true;

module.exports = function(grunt) {
    "use strict";

    var exec      = require('faithful-exec'), // Helpers for custom tasks, mainly around promises / exec
        os        = require('os'),
        fs        = require('fs.extra'),
        async     = require('async'),
        path      = require('path'),
        // shjs = require('shelljs');
        server;

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-karma');

    // Project configuration.
    grunt.initConfig({
        builddir: 'build',
        dirs: {
            "bower_components": 'bower_components',
            "jquery"          : 'libs',
            "angular"         : 'libs',
            "angular-mocks"   : 'libs'
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
                ' * @license MIT License, http://www.opensource.org/licenses/MIT\n',
                ' */',
            ].join('')
        },
        clean: {
            bower_components: ['<%= dirs.bower_components %>'],
            libs            : ['libs/*'],
            build           : ['<%= builddir %>']
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
            options: {
                jshintrc    : '.jshintrc',
                jshintignore: '.jshintignore'
            },
            server: {
                /*
                   TODO add option devel: true for production linting

                   This option defines globals that are usually used for
                   logging poor-man's debugging: console, alert, etc.
                   It is usually a good idea to not ship them in production because,
                   for example, console.log breaks in legacy versions of Internet Explorer.

                   http://www.jshint.com/docs/options/#devel
                 */
                options: {
                    ignores: ['server/spikes/*']
                },
                files: {
                    src: ['*.js', 'configs/*.js', 'server/**/*.js', 'test/unit/server/**/*.js'],
                }
            },
            client: {
                options: {
                    browser: true,
                    node   : false,
                    ignores: ['client/code/libs/**/*.js']
                },
                files: {
                    src: ['client/**/*.js']
                }
            }
        },
        nodeunit: {
            all        : ['test/unit/**/*.test.js'],
            root       : ['test/unit/server/*.js'],
            models     : ['test/unit/server/models/**/*.js'],
            controllers: ['test/unit/server/controllers/**/*.js'],
            rpc        : ['test/unit/server/rpc/**/*.js']
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
            e2e: {
                files: ['*.js', 'server/**/*.js', 'client/**/*.js', 'test/e2e/**/*.test.js'],
                tasks: ['karma:e2e:run']
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
            e2e: {
                singleRun: true,
                options: {
                    configFile: './configs/karma-e2e.conf.js',
                    proxies: {
                        '/': 'http://' + ":"  + "/"
                    }
                }
            },
            e2eBackground: {
                background: true,
                options: {
                    configFile: './configs/karma-e2e.conf.js',
                    proxies: {
                        '/': ' http://' + ":"  + "/"
                    }
                }
            },
            unitBackground: {
                background: true,
                browsers: [grunt.option('browser') || 'PhantomJS']
            }
        },
    });

    /**
     * Rename our watch task to 'monitor', then make actual 'watch'
     * task build things, then start test server
     */
    grunt.renameTask('watch', 'monitor');

    grunt.registerTask('default',                                                 ['jshint']);

    /* Test tasks */
    grunt.registerTask('test',                                                    ['test:server', 'test:client', 'test:e2e']);
    grunt.registerTask('test:server',                                             ['nodeunit:all']);
    grunt.registerTask('test:server:root',                                        ['nodeunit:root']);
    grunt.registerTask('test:server:models',                                      ['nodeunit:models']);
    grunt.registerTask('test:server:controllers',                                 ['nodeunit:controllers']);
    grunt.registerTask('test:server:rpc',                                         ['nodeunit:rpc']);
    grunt.registerTask('test:client',                                             ['karma:unit']);
    grunt.registerTask('test:e2e',                                                ['start:server', 'karma:e2e']);

    /* Watch tasks */
    grunt.registerTask('watch:dev', 'Run dev server and watch for changes',                              ['monitor:server']);
    grunt.registerTask('watch:test:server', 'Run unit tests for ./server/**/*.js and watch for changes', ['monitor:testServer']);
    grunt.registerTask('watch:test:server:roor', 'Run unit tests for ./server/*.js',                     ['monitor:testServerRoot']);
    grunt.registerTask('watch:test:server:models', 'Run unit tests for ./server/modeles/*.js'            ['monitor:testServerModels']);
    grunt.registerTask('watch:test:server:controllers', 'Run unit tests for ./server/controllers/*.js',  ['monitor:testServerControllers']);
    grunt.registerTask('watch:test:server:rpc', 'Run unit tests for ./server/rpc/*.js',                  ['monitor:testServerPrc']);
    grunt.registerTask('watch:test:client', 'Run unit tests for ./client/code/app/***.js',               ['karma:unitBackground', 'monitor:testClient']);
    grunt.registerTask('watch:test:e2e', 'Run end-to-end tests and watching changes',                    ['start:server', 'karma:e2eBackground', 'delay', 'monitor:e2e']);

    grunt.registerTask('clean:cache', 'Clean node modules cache', function() {
        clearCache();
    });

    /* bower */
    grunt.registerTask('bower', 'Download client liblalies from Bower repository and copy them across the project', ['clean:bower_components', 'bower-install', 'clean:libs', 'bower-copy', 'clean:bower_components']);

    /* release build tasks */
    // grunt.registerTask('release', 'Tag and perform a release', ['prepare-release', 'dist', 'perform-release']);
    // grunt.registerTask('dev', 'Run dev server and watch for changes', ['build', 'connect', 'karma:unitBackground', 'watch']);

    /* Helper tasks */
    grunt.registerTask('start:server', 'Run dev server once, uses for test porpuse', function() {
        var done = this.async();

        if (server) {
            server.stop();
            clearCache();
            server = null;
        }
        /* kepp it require here */
        server = require("./server/server.js" )
        server.start(done);
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
                _path = path.join(grunt.config.get('dirs.bower_components'), _module);
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

    grunt.registerTask('delay', 'test for wating, it should never call done()', function() {
        var done = this.async();
        setTimeout(done, 2000);
    });

    grunt.registerTask('do-nothing', 'test for doing nothing', function() {
        var option = grunt.option('foo');
        console.log('option', option);
        // var done = this.async();
        // done();
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