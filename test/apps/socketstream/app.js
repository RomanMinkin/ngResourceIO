"use strict";

var http = require('http'),
    ss = require('socketstream');

// Define a single-page client called 'main'
ss.client.define('main', {
  view: 'app.jade',
  css:  [''],
  code: ['libs/jquery.js', 'libs/angular.js', 'libs/angular-route.js', 'libs/ngResourceIO.js', 'app'],
  tmpl: '*'
});

// Serve this client on the root URL
ss.http.route('/', function(req, res){
  res.serveClient('main');
});

// Code Formatters
ss.client.formatters.add(require('ss-jade'));

ss.client.set({ browserifyExcludePaths: ['app'] });

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use('angular.js');

// Start web server
var server = http.Server(ss.http.middleware);
server.listen(3000);

// Start SocketStream
ss.start(server);