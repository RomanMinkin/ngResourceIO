/*global io, window, console*/

(function(){
    "use strict";

    var socket = window.socket = io.connect('http://localhost:3001');

    socket.on('news', function(data) {
        console.log(data);
        socket.emit('my other event', {
            my: 'data'
        });
    });
})();