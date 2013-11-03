/*global angular, window*/

(function(){
    "use strict";

    var app = window.app = angular.module('app', [
        'ngRoute',
        'ngResourceIO'
    ]);

    app.config(['$routeProvider', '$locationProvider', 'socketProvider',
        function($routeProvider,   $locationProvider,   socketProvider) {

        socketProvider.use('socket.io');

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
            var resource = new ResourceIO('1');

            resource = null;
    }]);
})();