/*global window, angular, console*/

(function( angular ){
    "use strict";
    var $resourceMinErr = angular.$$minErr('ngResourceIO');

    angular.module('ngResourceIO', [])

        .provider('resourceIOconfig', function() {
            var config = {
                "socketstream": {
                    SOCKET_INSTANCE                : 'ss',     //   window.ss
                    SOCKET_EVENT_METHOD            : 'event',  //   window.ss.event.on()
                    SOCKET_SEND_METHOD             : 'rpc',    //   window.ss.rpc()
                    SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub', //   window.ss.event.on()
                    SOCKET_MODEL_METHOD_DELIMITER  : '.',      //   window.ss.rpc('model.find', data)
                    SOCKET_MESSAGE_PARSE           : false     //   JSON.parse() all the incomming messages
                },
                "sockt.io": {
                    SOCKET_INSTANCE                : 'socket',  //  window.socket
                    SOCKET_EVENT_METHOD            : null,      //  window.socket.on()
                    SOCKET_SEND_METHOD             : 'emit',    //  window.socket.emit()
                    SOCKET_INCOMING_MESSAGE_PREFFIX: 'pubsub',  //  window.socket.on()
                    SOCKET_MODEL_METHOD_DELIMITER  : ':',       //  window.socket.emit('model.find', data)
                    SOCKET_MESSAGE_PARSE           : false      //  JSON.parse() all the incomming messages
                }
            },
            defaultConfigName = 'socket.io';

            this.setConfig = function(name, newConfig) {
                if (!name || name === '' || typeof name !== 'string' || typeof newConfig !== 'object') {
                    return false;
                } else {
                    if (config[name]) {
                        angular.extend({}, newConfig, config[name]);
                    } else {
                        config[name] = newConfig;
                    }
                    return true;
                }
            }

            this.getConfig = function(name) {
                return name ? config[name] : config;
            }

            this.setDefaultConfigName = function(name) {
                if (config[name]) {
                    defaultConfigName = name;
                    return true;
                } else {
                    return false;
                }
            }

            this.getDefaultConfigName = function() {
                return defaultConfigName;
            }

            this.$get = function(name) {
                return name ? config[name] : config[defaultConfigName];
            }
        })
        .provider('pubsub', function() {
            var preffix;

            this.setServerEventPreffix = function(name) {
                if (name && typeof name === 'string') {
                    preffix = name;
                }
            }


            this.$get =
                [       '$rootScope', 'resourceIOconfig',
                function($rootScope,   resourceIOconfig) {

                    var config = resourceIOconfig,
                        CALLER = config.SOCKET_EVENT_METHOD ? window[config.SOCKET_INSTANCE][config.SOCKET_EVENT_METHOD] : window[config.SOCKET_EVENT_METHOD],
                        old$on = $rootScope.$on; /* override the $on function */

                    Object.getPrototypeOf($rootScope).$on = function(name) {
                        console.log('name>>>>>', name);
                        var scope = this;
                        // if (name.length && name.substr(0, config.SOCKET_INCOMING_MESSAGE_PREFFIX.length) === config.SOCKET_INCOMING_MESSAGE_PREFFIX) {
                            /* in our case CALLER is ss.event */
                            // console.log('CALLER', CALLER);
                            CALLER.on(name, function(data) {
                                // console.log('data');
                                scope.$apply(function() {
                                    scope.$broadcast(name, config.SOCKET_MESSAGE_PARSE ? JSON.parse(data) : data);
                                });
                            });
                        // }
                        /* make sure to call angular's version */
                        old$on.apply(this, arguments);
                    };
            }]
        })

        .factory('rpc',
            [       '$rootScope', '$q', 'resourceIOconfig',
            function($rootScope,   $q,   resourceIOconfig) {
                var config = resourceIOconfig,
                    CALLER = config.SOCKET_SEND_METHOD ? window[config.SOCKET_INSTANCE][config.SOCKET_SEND_METHOD] : window[config.SOCKET_EVENT_METHOD];

                return function(command) {
                    var args     = Array.prototype.slice.apply(arguments),
                        deferred = $q.defer(),
                        error,
                        result;

                    CALLER.apply(config.SOCKET_INSTANCE, [command].concat(args.slice(1, args.length)).concat(function() {
                        error  = Array.prototype.slice.apply(arguments)[0];
                        result = Array.prototype.slice.apply(arguments)[1];

                        $rootScope.$apply(function() {
                            // deferred.notify('Working...');

                            /* Error habdeling */
                            if (error) {
                                deferred.reject(error);
                            } else {
                                deferred.resolve(result);
                            }
                        });
                    }));
                    return deferred.promise;
                };
            }
        ])

        .factory('resourceIO',
            [       '$rootScope', '$parse', '$q', 'resourceIOconfig', 'rpc',
            function($rootScope,   $parse,   $q,   resourceIOconfig,   rpc) {
                var config       = resourceIOconfig,
                    EVENT_CALLER = config.SOCKET_EVENT_METHOD ? window[config.SOCKET_INSTANCE][config.SOCKET_EVENT_METHOD] : window[config.SOCKET_EVENT_METHOD],

                DEFAULT_ACTIONS = {
                    'findById': {method:'find'},
                    'find'    : {method:'find', isArray: true},
                    'set'     : {method:'set', isPath: true},
                    'get'     : {method:'get', isPath: true},
                    'push'    : {method:'push', isPath: true},
                    'addToSet': {method:'addToSet', isPath: true},
                    'inc'     : {method:'inc', isPath: true},
                    'save'    : {method:'save'},
                    'remove'  : {method:'remove'}
                }
                ,
                DEFAULT_EVENTS = {
                    'update' : {idField: 'id',               fn: function(obj, data) { copy(data, obj) } },
                    'set'    : {idField: 'id', isPath: true, fn: function(obj, data) { extend(obj, data) } },
                    'remove' : {idField: 'id'}
                },

                noop           = angular.noop,
                forEach        = angular.forEach,
                extend         = angular.extend,
                isFunction     = angular.isFunction,
                copy           = angular.copy;


                function ResourceFactory(modelName, configName, actions, events) {
                    var onName   = [config.SOCKET_INCOMING_MESSAGE_PREFFIX, modelName ].join(':'),
                        listners = [];

                    actions = extend({}, DEFAULT_ACTIONS, actions);
                    events  = extend({}, DEFAULT_EVENTS, events);

                    function defaultResponseInterceptor(response) {
                        return response.resource;
                    }

                    function Resource(value) {
                        var self = this,
                            listners = [],
                            off,
                            reatachOff;

                        copy(value || {}, this);

                        function reatachListners() {
                            forEach(events, function(_event, _name) {
                                var _onName = onName.concat(':'+ _name),
                                    _id     = _event.idField || 'id';

                                off = $rootScope.$on(_onName, function(eventName, data) {
                                    if ( self[_id] === data[_id] ) {

                                        if (_event.fn && typeof _event.fn === 'function') {
                                            _event.fn(self, data);
                                        }

                                        if (_name === 'remove') {
                                            forEach(self.listners, function(off) {
                                                off();
                                            })
                                            if (typeof reatachOff === 'function') {
                                                reatachOff();
                                            }
                                        }
                                    }
                                });

                                listners.push({name: _name, off: off});

                            });

                            listners      = [];
                        }

                        reatachListners();
                        self.listners = listners;

                        reatachOff = $rootScope.$on(onName.concat(':reatach'), function() {
                            reatachListners();
                            self.listners = listners;
                        });

                    }

                    function turnListnersOn() {
                        var _i = 0;
                        forEach(events, function(_event, _name) {
                            var _onName = onName.concat(':'+ _name),
                                func;

                            if (EVENT_CALLER.listeners(_onName).length === 0) {
                                func = function(response) {
                                    var data    = response.data;
                                    /**
                                     * Broadcasting the event
                                     * remove the id from the onName: 'pubsub:user:remove:123123' => 'pubsub:user:remove'
                                     * So the ritem removement from the scope shoul be happen ut of resource object
                                     *
                                     * Ex.
                                     *     $scope.$on('pubsub:test:remove', function(evnt, obj) {
                                     *         ...do stuff...
                                     *     });
                                     */
                                    $rootScope.$apply(function() {
                                        console.log('regester broadcast', _onName);
                                        $rootScope.$broadcast(_onName, data);
                                    });
                                };
                                EVENT_CALLER.on(_onName, func);
                                listners.push({name: _onName, func: func});
                                _i++;
                            }
                        });
                        return _i ? true : false;
                    }

                    turnListnersOn();

                    Resource['$on'] = function(name, cb) {
                        var _onName,
                            _i;

                        _i = turnListnersOn();

                        forEach(events, function(_event, _name) {
                            if (name === _name) {
                                _onName = onName.concat(':'+ _name);

                                if (!$rootScope.$$listeners[_onName]) {
                                    _i++;
                                    $rootScope.$on(_onName, function(eventName2, data2){
                                        cb(data2);
                                    });
                                }
                            }
                        });

                        /**
                         * Which means come listners been attached, do we do not watnt to
                         * call ':reatach' one more time
                         */
                        console.log('_i', _i);
                        if (_i) {
                            $rootScope.$broadcast(onName.concat(':reatach'));
                            console.log('$on', $rootScope.$$listeners);
                        }
                    }

                    /**
                     * A little hack to add an .$off() method to $rootScope to unsubscribe from event
                     * @param  {String}   name Event name
                     * @param  {Function} cb
                     * @return {Void}
                     */
                    Resource['$off'] = function(complite, name) {
                        var _onName,
                            _events = events;

                        if (complite) {
                            _events.concat({reatach: true});
                        }

                        forEach(_events, function(_event, _name) {
                            _onName = onName.concat(':'+ _name);

                            if ($rootScope.$$listeners) {
                                if ($rootScope.$$listeners[_onName]) {
                                    if (name) {
                                        if (name === _name) {
                                            delete $rootScope.$$listeners[_onName]
                                        }
                                    }  else {
                                        delete $rootScope.$$listeners[_onName]
                                    }
                                }
                            }

                            if (EVENT_CALLER.listeners(_onName).length > 0) {
                                forEach(listners, function(listner) {
                                    if (listner.name === _onName) {
                                        if (name) {
                                            if (name === _name) {
                                                console.log('_onName', _onName, listner.name);
                                                EVENT_CALLER.off(_onName, listner.func);
                                            }
                                        }  else {
                                            console.log('_onName', _onName, listner.name);
                                            EVENT_CALLER.off(_onName, listner.func);
                                        }
                                    }
                                });
                            }
                        });
                        listners = [];
                        console.log('$off', $rootScope.$$listeners);
                    }

                    Resource.prototype['$on']  = Resource.$on;
                    Resource.prototype['$off'] = function(name) {
                        forEach(this.listners, function(listner) {
                            if (name) {
                                if (listner.name === name) {
                                    listner.off();
                                    console.log('off', listner.name);
                                }
                            } else {
                                listner.off();
                                console.log('off', listner.name);
                            }
                        });
                    };

                    forEach(actions, function(action, name) {
                        var isInstanceCall,
                            responseInterceptor,
                            responseErrorInterceptor,
                            value,
                            promise,
                            getter,
                            setter;

                        Resource[name] = function(a1, a2, a3, a4) {
                            var params = {}, data, success, error;

                            switch (arguments.length) {
                                case 4:
                                    error = a4;
                                    success = a3;
                                    /* falls through */
                                case 3:
                                case 2:
                                    if (isFunction(a2)) {
                                        if (isFunction(a1)) {
                                            success = a1;
                                            error = a2;
                                            break;
                                        }

                                        success = a2;
                                        error = a3;
                                        /* falls through */
                                    } else {
                                        params = a1;
                                        data = a2;
                                        success = a3;
                                        break;
                                    }
                                    /* falls through */
                                case 1:
                                    if (isFunction(a1)) {
                                        success = a1;

                                    } else {
                                        params = a1;
                                    }
                                    break;
                                case 0:
                                    break;
                                default:
                                    throw $resourceMinErr('badargs',
                                        "[ngResourceIO->resourceIO] Expected up to 4 arguments [params, data, success, error], got {0} arguments", arguments.length);
                            }

                            isInstanceCall           = data instanceof Resource;
                            value                    = isInstanceCall ? data : (action.isArray ? [] : new Resource(data));
                            responseInterceptor      = action.interceptor && action.interceptor.response || defaultResponseInterceptor;
                            responseErrorInterceptor = action.interceptor && action.interceptor.responseError || undefined;

                            promise = rpc( modelName + '.' + name, params ).then(function(response) {
                                var data    = response.data,
                                    promise = value.$promise;

                                if (data) {
                                    if (angular.isArray(data) !== Boolean(action.isArray)) {
                                        throw $resourceMinErr('badcfg', '[ngResourceIO->resourceIO] Error in resource configuration. Expected response' +
                                            ' to contain an {0} but got an {1}',
                                            action.isArray ? 'array' : 'object', angular.isArray(data) ? 'array' : 'object');
                                    }
                                    if (action.isArray) {
                                        value.length = 0;
                                        forEach(data, function(item) {
                                            value.push(new Resource(item));
                                            // bindEvents(item);
                                        });

                                    } else if (action.isPath && !action.isArray) {
                                        getter = $parse(params);
                                        setter = getter.assign;

                                        if (getter(data)) {
                                            setter(value, getter(data));
                                            // bindEvents(value);

                                        } else {
                                            throw $resourceMinErr('badargs',
                                                "[ngResourceIO->resourceIO] Mismatch in 'isPath' method call! Method '{0}({1})' for object modifying been called. Server sent wrong response: '{2}'",
                                                name, params, JSON.stringify(response));
                                        }
                                    } else {
                                        copy(data, value);
                                        // bindEvents(value);
                                        value.$promise = promise;
                                    }
                                }

                                value.$resolved   = true;
                                response.resource = value;

                                return response;
                            },
                            function(reason) {
                                value.$resolved = true;

                                (error||noop)(reason);

                                return $q.reject(reason);
                            });

                            promise = promise.then(
                                function(response) {
                                    var value = responseInterceptor(response);
                                    (success || noop)(value, response);
                                    return value;
                                },
                                responseErrorInterceptor
                            );

                            if (!isInstanceCall) {
                                // we are creating instance / collection
                                // - set the initial promise
                                // - return the instance / collection
                                value.$promise = promise;
                                value.$resolved = false;

                                return value;
                            }

                            // instance call
                            return promise;

                        };

                        Resource.prototype['$' + name] = function(params, success, error) {
                            if (isFunction(params)) {
                                error = success;
                                success = params;
                                params = {};
                            }
                            var result = Resource[name](params, this, success, error);
                            return result.$promise || result;
                        };
                    });
                    return Resource;
                }
                return ResourceFactory;
            }
        ]);
})( angular );