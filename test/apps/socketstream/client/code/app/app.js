/*global angular, window*/

(function(window){
    "use strict";

    var app;

    window.app = app = angular.module('app', [
        'ngRoute',
        'ngResourceIO'
    ]);

    app.config(['$routeProvider', '$locationProvider', 'resourceIOconfigProvider',
        function($routeProvider,   $locationProvider,   resourceIOconfigProvider) {

        resourceIOconfigProvider.setConfig({
            SOCKET_INSTANCE : 'ss',
            SOCKET_EVENT_METHOD : 'event',
            SOCKET_RPC_METHOD : 'rpc',
            SOCKET_RPC_PREFFIX : 'pubsub'
        });

        $locationProvider.html5Mode(true);

        $routeProvider.
            when('/', {
                templateUrl: 'index.html',
                controller: 'PhoneListCtrl'
            }).
            when('/test', {
                templateUrl: 'test.html',
                controller: 'PhoneListCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });
    }])

    app.controller('PhoneListCtrl',
        [        'resourceIO',
        function(ResourceIO) {
            var resource = new ResourceIO('1');

            resource.find();

    }]);
})(window);