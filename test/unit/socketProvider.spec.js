"use strict";

describe('$socketProvider', function() {
    var $socketProvider,
        defaultConfigName = 'socketstream',
        defaults = {
            "socketstream": {
                SOCKET_TYPE                    : 'socketstream',    //   Library type
                SOCKET_INSTANCE                : 'ss',              //   window.ss
                SOCKET_EVENT_METHOD            : 'event',           //   window.ss.event.on()
                SOCKET_RPC_METHOD              : 'rpc',             //   window.ss.rpc()
                SOCKET_SEND_METHOD             : 'send',            //   window.ss.send()
                SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub',          //   window.ss.event.on()
                SOCKET_MODEL_METHOD_DELIMITER  : '.',               //   window.ss.rpc('model.find', data)
                SOCKET_MESSAGE_PARSE           : false              //   JSON.parse() all the incomming messages
            },
            "socket.io": {
                SOCKET_TYPE                    : 'socket.io',       //  Library type
                SOCKET_INSTANCE                : 'socket',          //  window.socket
                SOCKET_EVENT_METHOD            : null,              //  window.socket.on()
                SOCKET_RPC_METHOD              : null,              //  window.socket.emit()
                SOCKET_SEND_METHOD             : 'send',            //  window.socket.send()
                SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub',          //  window.socket.on()
                SOCKET_MODEL_METHOD_DELIMITER  : ':',               //  window.socket.emit('model.find', data)
                SOCKET_MESSAGE_PARSE           : false              //  JSON.parse() all the incomming messages
            }
        }
    ;

    beforeEach(module('ngResourceIO', function(_$socketProvider_) {
        $socketProvider = _$socketProvider_;
    }));

    describe('#getDefaults()', function() {

        it('should return default config objects', inject(function() {
            expect( $socketProvider.getDefaults()).toEqual(defaults);
        }));

        it('should return default config object by name', inject(function() {
            expect( $socketProvider.getDefaults('socketstream') ).toEqual(defaults['socketstream']);
            expect( $socketProvider.getDefaults('socket.io') ).toEqual(defaults['socket.io']);
        }));
    });

    describe('#getConfig()', function() {
        it('should return an empty object {} if config has not been setted up', inject(function() {
            expect( $socketProvider.getConfig() ).toEqual({});
        }));

        it('should return config object by name if config has been set', inject(function() {
            expect( $socketProvider.setConfig('socketstream', defaults['socketstream']) ).toEqual(true);
            expect( $socketProvider.getConfig('socketstream') ).toEqual(defaults['socketstream']);


            expect( $socketProvider.setConfig('socket.io', defaults['socket.io']) ).toEqual(true);
            expect( $socketProvider.getConfig('socket.io') ).toEqual(defaults['socket.io']);
        }));

    });

    describe('#setConfig()', function() {

        it('should set config with a new name', inject(function() {
            var name   = 'socket.io.2',
                config = {
                    SOCKET_INSTANCE                : 'socket2',
                    SOCKET_EVENT_METHOD            : null,
                    SOCKET_SEND_METHOD             : 'emit2',
                    SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub2',
                    SOCKET_MODEL_METHOD_DELIMITER  : ':',
                    SOCKET_MESSAGE_PARSE           : false
            }

            expect( $socketProvider.setConfig(name, config)  ).toEqual(true);
            expect( $socketProvider.getConfig(name) ).toEqual(config);
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
            expect( $socketProvider.setConfig(name, config)  ).toEqual(true);
            expect( $socketProvider.getConfig(name) ).toEqual(config);
        }));

        it('should return false if name has been missed', inject(function() {
            expect( $socketProvider.setConfig() ).toEqual(false);
            expect( $socketProvider.setConfig('') ).toEqual(false);
        }));

        it('should return false if name has been set and new config object has not been specified', inject(function() {
            expect( $socketProvider.setConfig('test') ).toEqual(false);
            expect( $socketProvider.setConfig('test', false) ).toEqual(false);
        }));
    });

    describe('#getDefaultConfigName()', function() {
        it('should return default config object', inject(function() {
            expect( $socketProvider.getDefaultConfigName() ).toEqual( defaultConfigName );
        }));
    });

    describe('#use()', function() {
        it('should set default config object', inject(function() {
            var config = {
                socketstream: defaults['socketstream']
            }

            expect( $socketProvider.use('socketstream', true) ).toEqual(true);
            expect( $socketProvider.getDefaultConfigName() ).toEqual('socketstream');
            expect( $socketProvider.getConfig() ).toEqual(config);
        }));

        it('should not change default config object if second argument been missed', inject(function() {
            var config = {
                'socket.io': defaults['socket.io']
            }

            expect( $socketProvider.use('socket.io') ).toEqual(true);
            expect( $socketProvider.getDefaultConfigName() ).toEqual( defaultConfigName );
            expect( $socketProvider.getConfig() ).toEqual(config);
        }));

        it('should set `socket.io` as default config if second argument been passed', inject(function() {
            expect( $socketProvider.use('socketstream') ).toEqual(true);
            expect( $socketProvider.use('socket.io', true) ).toEqual(true);
            expect( $socketProvider.getDefaultConfigName() ).toEqual('socket.io');
            expect( $socketProvider.getConfig() ).toEqual(defaults);
        }));

        it('should keep socket.io as default config if second argument been missed', inject(function() {
            expect( $socketProvider.use('socketstream') ).toEqual(true);
            expect( $socketProvider.use('socket.io') ).toEqual(true);
            expect( $socketProvider.getDefaultConfigName() ).toEqual( defaultConfigName );
            expect( $socketProvider.getConfig() ).toEqual(defaults);
        }));

        it('should not set default config object if config name does not exists', inject(function() {
            expect( $socketProvider.use('does not exist')).toEqual(false);
            expect( $socketProvider.getDefaultConfigName() ).toEqual( defaultConfigName );
        }));
    });
})