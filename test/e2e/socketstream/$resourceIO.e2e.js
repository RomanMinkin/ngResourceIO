/* global ss */

/* Docs
   http://docs.angularjs.org/guide/dev_guide.e2e-testing
   https://github.com/yearofmoo/ngMidwayTester
 */

describe('$resourceIO', function() {
    "use strict";

    var $socketProvider;

     beforeEach(module('ngResourceIO', function(_$socketProvider_) {
        $socketProvider = _$socketProvider_;
        $socketProvider.use('socketstream');
    }));

     afterEach(function() {
        ss.event.removeAllListeners();
    });

    it('should be a object', inject(function($socket) {
        $socket.should.be.an.instanceOf(Object);
    }));

    it('should be a object', inject(function($resourceIO) {
        $resourceIO.should.be.an.instanceOf(Object);
    }));

    it('should be a object', inject(function($resourceIO) {
        var resource = $resourceIO('user');

        // console.log('resource', resource);
    }));

    it('should return default config object by name', function(done) {
        inject(function($rootScope, $timeout, $q, $socket) {
            var resolvedValue;

            $socket.rpc('user.find', { id: 111}).then(function(result) {
                resolvedValue = result;
                (resolvedValue).should.equal(1111);
                done();
            });
        })
    });
});