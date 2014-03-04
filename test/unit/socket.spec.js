(function(){
    'use strict';

    describe('$socket', function() {
        var
            // rootScope,
            // deferred,
            $socketProvider,
            // defaultConfigName = 'socketstream',
            defaults = {
                "socketstream": {
                    SOCKET_TYPE                    : 'socketstream',    //   Library type
                    SOCKET_INSTANCE                : 'ss',              //   window.ss
                    SOCKET_EVENT_METHOD            : 'event',           //   window.ss.event.on()
                    SOCKET_RPC_METHOD              : 'rpc',             //   window.ss.rpc()
                    SOCKET_SEND_METHOD             : 'send',            //   window.ss.send()
                    SOCKET_MODEL_METHOD_DELIMITER  : '.',               //   window.ss.rpc('model.find', data)
                    SOCKET_MODEL_EVENT_PREFFIX     : 'pubsub',          //   window.ss.event.on()
                    SOCKET_MODEL_EVENT_DELIMITER   : ':',               //   window.ss.event.on('pubsub.user', eventName, data)
                    SOCKET_MESSAGE_PARSE           : false              //   JSON.parse() all the incomming messages
                },
                "socket.io": {
                    SOCKET_TYPE                    : 'socket.io',       //  Library type
                    SOCKET_INSTANCE                : 'socket',          //  window.socket
                    SOCKET_EVENT_METHOD            : null,              //  window.socket.on()
                    SOCKET_RPC_METHOD              : null,              //  window.socket.emit()
                    SOCKET_SEND_METHOD             : 'send',            //  window.socket.send()
                    SOCKET_MODEL_EVENT_PREFFIX     : 'pubsub',          //  window.socket.on()
                    SOCKET_MODEL_METHOD_DELIMITER  : ':',               //  window.socket.emit('model.find', data)
                    SOCKET_MESSAGE_PARSE           : false              //  JSON.parse() all the incomming messages
                }
            }
        ;

        beforeEach(module('ngResourceIO', function(_$socketProvider_) {
            $socketProvider = _$socketProvider_;
            $socketProvider.setConfig('socket2.io', defaults["socket.io"]);
            $socketProvider.use('socket2.io', true);
        }));

        it('should be a object', inject(function($socket) {
            expect( typeof $socket ).toEqual('object');
        }));
    });
})();