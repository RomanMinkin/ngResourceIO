"use strict";

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
        $socketProvider.setConfig('socket2.io', defaults["socket.io"]);
        $socketProvider.use('socket2.io', true);
    }));

    it('should be a object', inject(function($socket) {
            expect( typeof $socket ).toEqual('object');
    }));

    // describe('.send()', function() {
    //     it('should be a function', inject(function(socket) {
    //         expect( typeof socket.send ).toEqual('function');
    //     }));

    //     it('should simulate promise', inject(function($q, $rootScope) {
    //             var deferred = $q.defer();
    //             var promise = deferred.promise;
    //             var resolvedValue;

    //             promise.then(function(value) {
    //                 resolvedValue = value;
    //             });
    //             expect(resolvedValue).toBeUndefined();

    //             // Simulate resolving of promise
    //             // deferred.resolve(123);

    //             // Note that the 'then' function does not get called synchronously.
    //             // This is because we want the promise API to always be async, whether or not
    //             // it got called synchronously or asynchronously.
    //             expect(resolvedValue).toBeUndefined();

    //             // Propagate promise resolution to 'then' functions using $apply().
    //             $rootScope.$apply();
    //             expect(resolvedValue).toEqual(123);
    //     }));

    //     // it('should return default config object by name', inject(function($rootScope, $q, socket) {
    //     //     var resolvedResult;

    //     //     socket.send('news.find').then(function(result){

    //     //         resolvedResult = result;
    //     //     }, function(reason){
    //     //         resolvedResult = reason;
    //     //     });
    //     //     // expect( resolvedResult ).toBeUndefined();

    //     //     $rootScope.$apply();
    //     //     expect(resolvedResult).toEqual(123);

    //     // }));
    // });
})