/* global ss, angular */

'use strict';

describe('$socket', function() {
    var $socketProvider;

    beforeEach(module('ngResourceIO', function(_$socketProvider_) {
        $socketProvider = _$socketProvider_;
        $socketProvider.use('socketstream');
    }));

    afterEach(function() {
        ss.event.removeAllListeners();
    });

    it('should be an object', inject(function($socket) {
        $socket.should.be.an.instanceOf(Object);
    }));

    it('should have #getConfig method', inject(function($socket) {
        $socket.getConfig.should.be.an.instanceOf(Function);
    }));

    it('should have #rpc method', inject(function($socket) {
        $socket.rpc.should.be.an.instanceOf(Function);
    }));

    it('should have sub-socket `socketstream`', inject(function($socket) {
        $socket['socketstream'].should.be.an.instanceOf(Object);
    }));

    it('should have #prc method for sub-socket `socketstream`', inject(function($socket) {
        $socket['socketstream'].should.be.an.instanceOf(Object);
    }));

    it('should have #prc method for sub-socket `socketstream` equal to the base #rpc', inject(function($socket) {
        $socket['socketstream'].rpc.should.eql($socket.rpc);
    }));

    it('should send a simple RPC call to server', function(done) {
        inject(function($socket) {
            $socket.rpc('user.find').then(function(data) {
                data.should.be.an.instanceOf(Array).and.have.lengthOf(3);
                done();
            });
        })
    });

    it('should send a simple RPC call to server', function(done) {
        inject(function($socket) {
            $socket['socketstream'].rpc('user.find').then(function(data) {
                data.should.be.an.instanceOf(Array).and.have.lengthOf(3);
                done();
            });
        })
    });
});