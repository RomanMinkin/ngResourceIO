"use strict";

describe('resourceIOconfigProvider', function() {
    var _resourceIOconfigProvider;

    beforeEach(module('ngResourceIO', function(resourceIOconfigProvider) {
        _resourceIOconfigProvider = resourceIOconfigProvider;
    }));

    describe('.getConfig()', function() {
        it('should return default config objects', inject(function() {
            var config = {
                "socketstream": {
                    SOCKET_INSTANCE                : 'ss',
                    SOCKET_EVENT_METHOD            : 'event',
                    SOCKET_SEND_METHOD             : 'rpc',
                    SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub',
                    SOCKET_MODEL_METHOD_DELIMITER  : '.',
                    SOCKET_MESSAGE_PARSE           : false
                },
                "sockt.io": {
                    SOCKET_INSTANCE                : 'socket',
                    SOCKET_EVENT_METHOD            : null,
                    SOCKET_SEND_METHOD             : 'emit',
                    SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub',
                    SOCKET_MODEL_METHOD_DELIMITER  : ':',
                    SOCKET_MESSAGE_PARSE           : false
                }
            };

            expect( _resourceIOconfigProvider.getConfig() ).toEqual(config);
        }));

        it('should return config object by name', inject(function() {
            var config = {
                "socketstream": {
                    SOCKET_INSTANCE                : 'ss',
                    SOCKET_EVENT_METHOD            : 'event',
                    SOCKET_SEND_METHOD             : 'rpc',
                    SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub',
                    SOCKET_MODEL_METHOD_DELIMITER  : '.',
                    SOCKET_MESSAGE_PARSE           : false
                },
                "sockt.io": {
                    SOCKET_INSTANCE                : 'socket',
                    SOCKET_EVENT_METHOD            : null,
                    SOCKET_SEND_METHOD             : 'emit',
                    SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub',
                    SOCKET_MODEL_METHOD_DELIMITER  : ':',
                    SOCKET_MESSAGE_PARSE           : false
                }
            }

            expect( _resourceIOconfigProvider.getConfig('socketstream') ).toEqual(config['socketstream']);
            expect( _resourceIOconfigProvider.getConfig('sockt.io') ).toEqual(config['sockt.io']);
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

            expect( _resourceIOconfigProvider.setConfig(name, config)  ).toEqual(true);
            expect( _resourceIOconfigProvider.getConfig(name) ).toEqual(config);
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
            expect( _resourceIOconfigProvider.setConfig(name, config)  ).toEqual(true);
            expect( _resourceIOconfigProvider.getConfig(name) ).toEqual(config);
        }));

        it('should return false if name has not been specified', inject(function() {
            expect( _resourceIOconfigProvider.setConfig() ).toEqual(false);
            expect( _resourceIOconfigProvider.setConfig('') ).toEqual(false);
        }));

        it('should return false if new config object has not been specified', inject(function() {
            expect( _resourceIOconfigProvider.setConfig('test') ).toEqual(false);
            expect( _resourceIOconfigProvider.setConfig('test', false) ).toEqual(false);
        }));
    });

    describe('.getDefaultConfigName()', function() {
        it('should return default config object', inject(function() {
            expect( _resourceIOconfigProvider.getDefaultConfigName() ).toEqual('socket.io');
        }));
    });

    describe('.setDefaultConfigName()', function() {
        it('should set default config object', inject(function() {
            expect( _resourceIOconfigProvider.setDefaultConfigName('socketstream') ).toEqual(true);
            expect( _resourceIOconfigProvider.getDefaultConfigName() ).toEqual('socketstream');
        }));

        it('should not set default config object if config name does not exists', inject(function() {
            expect( _resourceIOconfigProvider.setDefaultConfigName('do not exist')).toEqual(false);
            expect( _resourceIOconfigProvider.getDefaultConfigName() ).toEqual('socket.io');
        }));
    });
})