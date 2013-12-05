"use strict";

var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server);

app.use(express.static('static'));

app.get('*', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
    socket.emit('news.set', {hello: 'world'});
    socket.emit('news.get', {hello: 'world'});

    socket.on('news.find', function(data) {
        socket.emit('news.find', null, {data: data});
    });
});

server.listen(process.env.PORT || 3001, function() {
    console.log('Socket.io App\'s back end is listening on http://localhost:3001');
});