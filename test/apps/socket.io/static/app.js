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
        [       'socket', 'resourceIO',
        function(socket,   ResourceIO) {
            // var resource = new ResourceIO('1');

            // resource = null;

            setTimeout(function(){
                socket.send('news.find', 1).then(function(result){
                    console.log('result2 >> ', result);

                }, function(reason){

                    console.log('reason2 >> ', reason);
                });
            }, 1);
            socket.send('news.find', 2).then(function(result){
                console.log('result1 >> ', result);

            }, function(reason){

                console.log('reason1 >> ', reason);
            });
    }]);
})();