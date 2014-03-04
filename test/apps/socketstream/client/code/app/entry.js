/*global window, console, require, ss*/
/*jslint node: true */
'use strict';

window.ss = require('socketstream');

ss.server.on('disconnect', function(){
  console.log('Connection with socketstream server is down :-(');
});

ss.server.on('reconnect', function(){
  console.log('Connection with socketstream server is back up :-)');
});

ss.server.on('ready', function(){});
