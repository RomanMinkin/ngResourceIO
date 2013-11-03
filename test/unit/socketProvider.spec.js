"use strict";

describe('socketProvider', function() {
    var socketProvider,
        defaults = {
        "socketstream": {
            SOCKET_INSTANCE                : 'ss',
            SOCKET_EVENT_METHOD            : 'event',
            SOCKET_SEND_METHOD             : 'rpc',
            SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub',
            SOCKET_MODEL_METHOD_DELIMITER  : '.',
            SOCKET_MESSAGE_PARSE           : false
        },
        "socket.io": {
            SOCKET_INSTANCE                : 'socket',
            SOCKET_EVENT_METHOD            : null,
            SOCKET_SEND_METHOD             : 'emit',
            SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub',
            SOCKET_MODEL_METHOD_DELIMITER  : ':',
            SOCKET_MESSAGE_PARSE           : false
        }
    };

    beforeEach(module('ngResourceIO', function(_socketProvider_) {
        socketProvider = _socketProvider_;
    }));

    describe('.getDefaults()', function() {

        it('should return default config objects', inject(function() {
            expect( socketProvider.getDefaults()).toEqual(defaults);
        }));

        it('should return default config object by name', inject(function() {
            expect( socketProvider.getDefaults('socketstream') ).toEqual(defaults['socketstream']);
            expect( socketProvider.getDefaults('socket.io') ).toEqual(defaults['socket.io']);
        }));
    });

    describe('.getConfig()', function() {
        it('should return an empty object {} if config has not been setted up', inject(function() {
            expect( socketProvider.getConfig() ).toEqual({});
        }));

        it('should return config object by name', inject(function() {
            expect( socketProvider.setConfig('socketstream', defaults['socketstream']) ).toEqual(true);
            expect( socketProvider.getConfig('socketstream') ).toEqual(defaults['socketstream']);


            expect( socketProvider.setConfig('socket.io', defaults['socket.io']) ).toEqual(true);
            expect( socketProvider.getConfig('socket.io') ).toEqual(defaults['socket.io']);
        }));

    });

    describe('.setConfig()', function() {

        it('should set/add config with a new name', inject(function() {
            var name   = 'socket.io.2',
                config = {
                    SOCKET_INSTANCE                : 'socket2',
                    SOCKET_EVENT_METHOD            : null,
                    SOCKET_SEND_METHOD             : 'emit2',
                    SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub2',
                    SOCKET_MODEL_METHOD_DELIMITER  : ':',
                    SOCKET_MESSAGE_PARSE           : false
            }

            expect( socketProvider.setConfig(name, config)  ).toEqual(true);
            expect( socketProvider.getConfig(name) ).toEqual(config);
        }));

        it('should overwrite existing config', inject(function() {
            var name   = 'socket.io',
                config = {
                    SOCKET_INSTANCE                : 'socket2',
                    SOCKET_EVENT_METHOD            : null,
                    SOCKET_SEND_METHOD             : 'emit2',
                    SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub2',
                    SOCKET_MODEL_METHOD_DELIMITER  : ':',
                    SOCKET_MESSAGE_PARSE           : false
            }
            expect( socketProvider.setConfig(name, config)  ).toEqual(true);
            expect( socketProvider.getConfig(name) ).toEqual(config);
        }));

        it('should return false if name has not been specified', inject(function() {
            expect( socketProvider.setConfig() ).toEqual(false);
            expect( socketProvider.setConfig('') ).toEqual(false);
        }));

        it('should return false if new config object has not been specified', inject(function() {
            expect( socketProvider.setConfig('test') ).toEqual(false);
            expect( socketProvider.setConfig('test', false) ).toEqual(false);
        }));
    });

    describe('.getDefaultConfigName()', function() {
        it('should return default config object', inject(function() {
            expect( socketProvider.getDefaultConfigName() ).toEqual('socket.io');
        }));
    });

    describe('.use()', function() {
        it('should set default config object', inject(function() {
            var config = {
                socketstream: defaults['socketstream']
            }

            expect( socketProvider.use('socketstream', true) ).toEqual(true);
            expect( socketProvider.getDefaultConfigName() ).toEqual('socketstream');
            expect( socketProvider.getConfig() ).toEqual(config);
        }));

        it('should not set default config object if second argumant been messed', inject(function() {
            var config = {
                socketstream: defaults['socketstream']
            }

            expect( socketProvider.use('socketstream') ).toEqual(true);
            expect( socketProvider.getDefaultConfigName() ).toEqual('socket.io');
            expect( socketProvider.getConfig() ).toEqual(config);
        }));

        it('should set `socketstream` as default config if second argumant been passed', inject(function() {
            expect( socketProvider.use('socket.io') ).toEqual(true);
            expect( socketProvider.use('socketstream', true) ).toEqual(true);
            expect( socketProvider.getDefaultConfigName() ).toEqual('socketstream');
            expect( socketProvider.getConfig() ).toEqual(defaults);
        }));

        it('should keep socket.io as default config if second argumant been messed', inject(function() {
            expect( socketProvider.use('socket.io') ).toEqual(true);
            expect( socketProvider.use('socketstream') ).toEqual(true);
            expect( socketProvider.getDefaultConfigName() ).toEqual('socket.io');
            expect( socketProvider.getConfig() ).toEqual(defaults);
        }));

        it('should not set default config object if config name does not exists', inject(function() {
            expect( socketProvider.use('do not exist')).toEqual(false);
            expect( socketProvider.getDefaultConfigName() ).toEqual('socket.io');
        }));
    });
})