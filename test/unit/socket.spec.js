"use strict";

// window._socket = io.connect('http://localhost:3001');
window._socket = window.parent.io.connect('http://localhost:3001');

describe('socket', function() {
    var rootScope,
        deferred,
        socketProvider,
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
            SOCKET_INSTANCE                : '_socket',
            SOCKET_EVENT_METHOD            : null,
            SOCKET_SEND_METHOD             : 'emit',
            SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub',
            SOCKET_MODEL_METHOD_DELIMITER  : ':',
            SOCKET_MESSAGE_PARSE           : false
        }
    };

    beforeEach(module('ngResourceIO', function(_socketProvider_) {
        socketProvider = _socketProvider_;
        socketProvider.setConfig('socket2.io', defaults["socket.io"]);
        socketProvider.use('socket2.io', true);


    }));

    it('should be a object', inject(function(socket) {
            expect( typeof socket ).toEqual('object');
    }));

    describe('.send()', function() {
        it('should be a function', inject(function(socket) {
            expect( typeof socket.send ).toEqual('function');
        }));

        it('should simulate promise', inject(function($q, $rootScope) {
                var deferred = $q.defer();
                var promise = deferred.promise;
                var resolvedValue;

                promise.then(function(value) {
                    resolvedValue = value;
                });
                expect(resolvedValue).toBeUndefined();

                // Simulate resolving of promise
                // deferred.resolve(123);

                // Note that the 'then' function does not get called synchronously.
                // This is because we want the promise API to always be async, whether or not
                // it got called synchronously or asynchronously.
                expect(resolvedValue).toBeUndefined();

                // Propagate promise resolution to 'then' functions using $apply().
                $rootScope.$apply();
                expect(resolvedValue).toEqual(123);
        }));

        // it('should return default config object by name', inject(function($rootScope, $q, socket) {
        //     var resolvedResult;

        //     socket.send('news.find').then(function(result){

        //         resolvedResult = result;
        //     }, function(reason){
        //         resolvedResult = reason;
        //     });
        //     // expect( resolvedResult ).toBeUndefined();

        //     $rootScope.$apply();
        //     expect(resolvedResult).toEqual(123);

        // }));
    });
})