/* global ss, should */

/* Docs
   http://docs.angularjs.org/guide/dev_guide.e2e-testing
   https://github.com/yearofmoo/ngMidwayTester
 */

describe('$resourceIO', function() {
    "use strict";

    var $socketProvider,
        $rootScope,
        ResourceIO,
        resource,
        usersData = [
            {id : 1111, name: 'Roman'},
            {id : 2222, name: 'Kolya'},
            {id : 3333, name: 'Vasya'}
        ]
    ;

    beforeEach(module('ngResourceIO', function(_$socketProvider_) {
        $socketProvider = _$socketProvider_;
        $socketProvider.use('socketstream');
    }));

    beforeEach(inject(function(_$rootScope_) {
        $rootScope = _$rootScope_.$new();
    }));

    afterEach(function() {
        ss.event.removeAllListeners();
    });

    it('should be an function', inject(function($resourceIO) {
        $resourceIO.should.be.an.instanceOf(Function);
    }));

    /**
     * Defaul methods:
     *
     *  'findById': {method:'find'},
     *  'find'    : {method:'find', isArray: true},
     *  'set'     : {method:'set', isPath: true},
     *  'get'     : {method:'get', isPath: true},
     *  'push'    : {method:'push', isPath: true},
     *  'addToSet': {method:'addToSet', isPath: true},
     *  'inc'     : {method:'inc', isPath: true},
     *  'save'    : {method:'save'},
     *  'remove'  : {method:'remove'}
     *
     * Default event listners:
     *
     *  'update' : {idField: 'id',               fn: function(obj, data) { copy(data, obj) } },
     *  'set'    : {idField: 'id', isPath: true, fn: function(obj, data) { extend(obj, data) } },
     *  'push'   : {},
     *  'remove' : {idField: 'id'}
     *
     */
    describe('new $resourceIO()', function() {
        beforeEach(inject(function($resourceIO) {
            ResourceIO = $resourceIO;
            resource   = new ResourceIO('user');
        }));

        it('should return a new resource instance', function() {
            resource.should.be.an.instanceOf(Function);
        });

        it('should not create any listners in $rootScope.$$listeners by default', function() {
            $rootScope.$$listeners.should.be.eql({});
        });

        describe('#find', function() {
            it('should be a function', function() {
                resource.find.should.be.an.instanceOf(Function);
            });

            it('should query array with resources', function(done) {
                resource.find(function(err, data) {
                    (err == null).should.be.ok;
                    data.should.be.an.instanceOf(Array).and.have.lengthOf(3);
                    data[0].should.be.an.instanceOf(resource);
                    data[1].should.be.an.instanceOf(resource);
                    data[2].should.be.an.instanceOf(resource);
                    done();
                });
            });
        });

        describe('#set', function() {
            it('should be a function', function() {
                resource.set.should.be.an.instanceOf(Function);
            });
        });

        describe('#get', function() {
            it('should be a function', function() {
                resource.get.should.be.an.instanceOf(Function);
            });
        });

        describe('#push', function() {
            it('should be a function', function() {
                resource.push.should.be.an.instanceOf(Function);
            });
        });

        describe('#addToSet', function() {
            it('should be a function', function() {
                resource.addToSet.should.be.an.instanceOf(Function);
            });
        });

        describe('#inc', function() {
            it('should be a function', function() {
                resource.inc.should.be.an.instanceOf(Function);
            });
        });

        describe('#save', function() {
            it('should be a function', function() {
                resource.save.should.be.an.instanceOf(Function);
            });
        });

        describe('#remove', function() {
            it('should be a function', function() {
                resource.remove.should.be.an.instanceOf(Function);
            });
        });

        describe('#off', function() {
            it('should be a function', function() {
                resource.off.should.be.an.instanceOf(Function);
            });
        });

        describe('#on', function() {
            it('should be a function', function() {
                resource.on.should.be.an.instanceOf(Function);
            });

            it('should not create any listners in $rootScope.$$listeners by default', function() {
                resource.on();
                $rootScope.$$listeners.should.be.eql({});
            });
        });
    });
});