/*global angular, window*/

(function(){
    "use strict";

    var app = window.app = angular.module('app', [
        'ngRoute',
        'ngResourceIO'
    ]);

    app.config(['$routeProvider', '$locationProvider', 'resourceIOconfigProvider',
        function($routeProvider,   $locationProvider,   resourceIOconfigProvider) {

        resourceIOconfigProvider.setConfig({
            SOCKET_INSTANCE : 'socket',
            SOCKET_EVENT_METHOD : 'emit',
            // SOCKET_RPC_METHOD : 'rpc',
            SOCKET_RPC_PREFFIX : 'pubsub'
        });

        $locationProvider.html5Mode(true);

        $routeProvider.
            when('/', {
                templateUrl: 'index.html',
                controller: 'testController'
            }).
            when('/test', {
                templateUrl: 'test.html',
                controller: 'testController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }])

    app.controller('testController',
        [        'resourceIO',
        function(ResourceIO) {
            // var resource = new ResourceIO('1');

            // resource.find();

    }]);
})();