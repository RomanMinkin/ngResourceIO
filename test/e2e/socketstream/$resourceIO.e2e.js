/* global ss */

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
            {id : 1, name: 'Roman'},
            {id : 2, name: 'Kolya'},
            {id : 3, name: 'Vasya'}
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

        it('should not create any listners in $rootScope.$$listeners by default', inject(function($rootScope) {
            $rootScope.$$listeners.should.be.eql({});
        }));

        describe('event', function() {
            var _data;

            beforeEach(function(done) {
                resource.find(function(err, data) {
                    _data = data;
                    done();
                });
            });

            describe(':new', function() {
                it('should return a new instance of ResourceIO', function(done) {
                    inject(function($socket) {
                        $socket.rpc('user._mockEventNew').then(function(response) {
                            response.should.be.equal(true);
                        })
                        resource.on('new', function(newObject){
                            newObject.should.be.an.instanceOf(resource);
                            done();
                        })
                    });
                });

                it('should return a new instance with data equal back-end data', function(done) {
                    inject(function($socket) {
                        $socket.rpc('user._mockEventNew').then(function(response) {
                            response.should.be.equal(true);
                        })
                        resource.on('new', function(newObject){
                            newObject.id.should.be.equalToData({id: 4, name: 'Petya'});
                            done();
                        })
                    });
                });
            });
        });

        describe('#find', function() {
            var _data;

            beforeEach(function(done) {
                resource.find(function(err, data) {
                    (err == null).should.be.equal(true);
                    _data = data;
                    done();
                });
            });

            it('should be a function', function() {
                resource.find.should.be.an.instanceOf(Function);
            });

            it('should query array with resources and each resource object should be ab instance of new ResourceIO()', function() {
                _data.should.be.an.instanceOf(Array).and.have.lengthOf(3);
                _data[0].should.be.an.instanceOf(resource);
                _data[1].should.be.an.instanceOf(resource);
                _data[2].should.be.an.instanceOf(resource);
            });

            it('should query array with resources and each resource should contain actual data from back end', function() {
                _data[0].id.should.be.equal(usersData[0].id);
                _data[0].name.should.be.equal(usersData[0].name);

                _data[1].id.should.be.equal(usersData[1].id);
                _data[1].name.should.be.equal(usersData[1].name);

                _data[2].id.should.be.equal(usersData[2].id);
                _data[2].name.should.be.equal(usersData[2].name);
            });

            it('should create listener for each new $resourceIO instance', function(done) {
                inject(function($rootScope) {
                    $rootScope.$$listeners['pubsub:user'].should.be.an.instanceOf(Array).and.have.lengthOf(3);
                    done();
                });
            });
        });

        describe('event', function() {
            var _data;

            beforeEach(function(done) {
                resource.find(function(err, data) {
                    _data = data;
                    done();
                });
            });

            describe(':new', function() {
                it('should not change any instance', function(done) {
                    inject(function($socket) {
                        $socket.rpc('user._mockEventNew').then(function(response) {
                            response.should.be.equal(true);
                        });
                        resource.on('new', function(){
                            _data[0].id.should.be.equal(usersData[0].id);
                            _data[0].name.should.be.equal(usersData[0].name);

                            _data[1].id.should.be.equal(usersData[1].id);
                            _data[1].name.should.be.equal(usersData[1].name);

                            _data[2].id.should.be.equal(usersData[2].id);
                            _data[2].name.should.be.equal(usersData[2].name);
                            done();
                        })
                    });
                });
            });

            describe(':update', function() {
                it('should update only one instance completely except `id`', function(done) {
                    inject(function($socket) {
                        var updatedUser = {
                                id: 2,
                                name: 'Updated Name',
                                address: 'New York'
                            }
                        ;

                        $socket.rpc('user._mockEventUpdate', updatedUser).then(function() {
                            _data[1].should.be.equalToData(updatedUser);
                            _data[0].should.be.equalToData(usersData[0]);
                            _data[2].should.be.equalToData(usersData[0]);

                            done();
                        })
                    });
                });
            });

            describe(':set', function() {
                it('should set a new value to existing field', function(done) {
                    inject(function($socket) {
                        var dataToSet = {
                                id: _data[0].id,
                                name: 'my new Name'
                            }
                        ;

                        $socket.rpc('user._mockEventSet', dataToSet).then(function() {
                            _data[0].should.be.equalToData(dataToSet);
                            _data[1].should.be.equalToData(usersData[1]);
                            _data[2].should.be.equalToData(usersData[2]);

                            done();
                        })
                    });
                });

                it('should set a new value to un-existing field', function(done) {
                    inject(function($socket) {
                        var dataToUpdate = {
                                id: 2,
                                address: 'New York',
                            }
                        ;

                        $socket.rpc('user._mockEventSet', dataToUpdate).then(function() {
                            _data[1].id.should.be.equal(dataToUpdate.id);
                            _data[1].name.should.be.equal('Kolya');
                            _data[1].address.should.be.equal(dataToUpdate.address);
                            done();
                        })
                    });
                });
            });

            describe(':remove', function() {
                it('should remove (turn off) the instance listener', function(done) {
                    inject(function($rootScope, $socket) {
                        $socket.rpc('user._mockEventRemove', {id: usersData[1].id}).then(function(response) {
                            response.should.be.equal(true);
                            ($rootScope.$$listeners['pubsub:user'][1] == null).should.be.equal(true);
                            done();
                        })
                    });
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