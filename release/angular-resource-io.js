/*!
 * Module for Angular.js framework, a factory which creates a resource object that lets interact with server-side data sources by using  WebSockets as  transport layer.
 *
 * @version v0.0.2
 * @link https://github.com/RomanMinkin/ngResourceIO
 * @author Roman Minkin <minkinroman@gmail.com>
 * @license MIT License, https://raw.github.com/RomanMinkin/ngResourceIO/master/LICENSE
 */
(function( angular ) {
    /*global window, angular */
    'use strict';

    var $resourceMinErr = angular.$$minErr('ngResourceIO');

    /**
     * Create a shallow copy of an object and clear other fields from the destination
     */
    function shallowClearAndCopy(src, dst) {
      dst = dst || {};

      angular.forEach(dst, function(value, key){
        delete dst[key];
      });

      for (var key in src) {
        if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
          dst[key] = src[key];
        }
      }

      return dst;
    }

    angular.module('ngResourceIO', [])

        .provider('$socket', function() {
            var config   = {},
                defaults = {
                    "socketstream": {
                        SOCKET_TYPE                    : 'socketstream',    //   Library type
                        SOCKET_INSTANCE                : 'ss',              //   window.ss
                        SOCKET_EVENT_METHOD            : 'event',           //   window.ss.event.on()
                        SOCKET_RPC_METHOD              : 'rpc',             //   window.ss.rpc()
                        SOCKET_SEND_METHOD             : 'send',            //   window.ss.send()
                        SOCKET_MODEL_METHOD_DELIMITER  : '.',               //   window.ss.rpc('model.find', data)
                        SOCKET_MODEL_EVENT_PREFFIX     : 'pubsub',          //   window.ss.event.on()
                        SOCKET_MODEL_EVENT_DELIMITER   : ':',               //   window.ss.event.on('pubsub.user', eventName, data)
                        SOCKET_MESSAGE_PARSE           : false              //   JSON.parse() all the incomming messages
                    },
                    "socket.io": {
                        SOCKET_TYPE                    : 'socket.io',       //  Library type
                        SOCKET_INSTANCE                : 'socket',          //  window.socket
                        SOCKET_EVENT_METHOD            : null,              //  window.socket.on()
                        SOCKET_RPC_METHOD              : null,              //  window.socket.emit()
                        SOCKET_SEND_METHOD             : 'send',            //  window.socket.send()
                        SOCKET_MODEL_EVENT_PREFFIX     : 'pubsub',          //  window.socket.on()
                        SOCKET_MODEL_METHOD_DELIMITER  : ':',               //  window.socket.emit('model.find', data)
                        SOCKET_MESSAGE_PARSE           : false              //  JSON.parse() all the incomming messages
                    }
                },
            defaultConfigName = 'socketstream';

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

            this.getDefaults = function(name) {
                return name ? defaults[name] : defaults;
            }

            this.use = function(name, isDefault) {
                if (defaults[name]) {
                    if (isDefault) {
                        defaultConfigName = name;
                    }
                    config[name] = defaults[name];
                    return true;

                } else if (isDefault && config[name] && defaultConfigName !== name) {
                    defaultConfigName = name;
                    return true;

                } else {
                    return false;
                }
            }

            this.getDefaultConfigName = function() {
                return defaultConfigName;
            }

            this.$get =
                [       '$rootScope', '$q',
                function($rootScope,   $q) {
                    var _defaultRPC,
                        _name,
                        _sockets = {};

                    function getConfig(name) {
                        return name ? config[name] : config[defaultConfigName];
                    }


                    function rpc(command, config) {
                        var CALLER   = window[config.SOCKET_INSTANCE][config.SOCKET_RPC_METHOD],
                            args     = Array.prototype.slice.apply(arguments),
                            deferred = $q.defer();


                        function rpcCallback() {
                            var error  = Array.prototype.slice.apply(arguments)[0],
                                result = Array.prototype.slice.apply(arguments)[1];

                            $rootScope.$apply(function() {
                                // deferred.notify('Working...');
                                if (error) {
                                    deferred.reject(error);

                                } else {
                                    deferred.resolve(result);
                                }

                                // window[config.SOCKET_INSTANCE].removeListener(command, rpcCallback);
                            });
                        }


                        if (config.SOCKET_TYPE === 'socket.io') {
                            CALLER.apply(window[config.SOCKET_INSTANCE], [command].concat(args.slice(2, args.length)));

                            window[config.SOCKET_INSTANCE].on(command, rpcCallback );

                            return deferred.promise;

                        } else if (config.SOCKET_TYPE === 'socketstream') {
                            CALLER.apply(window[config.SOCKET_INSTANCE], [command].concat(args.slice(2, args.length)).concat(rpcCallback))
                            return deferred.promise;
                        }
                    }

                    for (_name in config) {
                        /*jshint loopfunc:true */
                        if (config.hasOwnProperty(_name)) {

                            _sockets[_name] = {
                                rpc: function(command) {
                                    var args     = Array.prototype.slice.apply(arguments);
                                    return rpc.apply(rpc, [command, config[_name]].concat(args.slice(1, args.length)));
                                }
                            }

                            if (_name === defaultConfigName) {
                                _defaultRPC = _sockets[_name].rpc;
                            }
                        }
                    }

                    /**
                     * Extend return object with .rpc() method for each active socket's config
                     * So each active socket instence .rpc() method can be called as
                     *
                     *     socket['config_name'].rpc(command, callback)
                     * or
                     *     socket['socketstream'].rpc(command, callback)
                     *     socket['socket.io'].rpc(command, callback)
                     *
                     * Default socket instance caould call as
                     *     socket.rpc(command, callback)
                     */
                    return angular.extend(_sockets,
                        {
                            getConfig: getConfig,
                            rpc     : _defaultRPC
                        }
                    );
                }];
        })

        .factory('$resourceIO',
            [       '$rootScope', '$parse', '$q', '$socket',
            function($rootScope,   $parse,   $q,   $socket) {
                var config       = $socket.getConfig(),
                    EVENT_CALLER,

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
                        'new'    : {isNew: true},
                        'update' : {idField: 'id',               fn: function(obj, newObj) { copy(newObj, obj); } },
                        'set'    : {idField: 'id', isPath: true, fn: function(obj, data)   { extend(obj, data); } },
                        'remove' : {idField: 'id'}
                    },

                    noop           = angular.noop,
                    forEach        = angular.forEach,
                    extend         = angular.extend,
                    isFunction     = angular.isFunction,
                    copy           = angular.copy;

                if (!config) {
                    throw $resourceMinErr('badconf', "[ngResourceIO->$socketProvider] Default config for socket instance has not been found! Please use `$socketProvider.use('config_name', true);` inside `app.config(){...}` defenition!");
                }

                EVENT_CALLER = config.SOCKET_EVENT_METHOD ? window[config.SOCKET_INSTANCE][config.SOCKET_EVENT_METHOD] : window[config.SOCKET_EVENT_METHOD];

                function ResourceIOFactory(modelName, settings, actions, events) {
                    var onName    = [config.SOCKET_MODEL_EVENT_PREFFIX, modelName ].join(config.SOCKET_MODEL_EVENT_DELIMITER);

                    actions  = extend({}, DEFAULT_ACTIONS, actions);
                    events   = extend({}, DEFAULT_EVENTS, events);
                    settings = extend({}, settings);

                    function defaultResponseInterceptor(response) {
                        return response.resource;
                    }

                    function socketEventCallback(eventName, response) {
                        /**
                         * Broadcasting the event
                         * Ex.
                         *     $scope.$on('pubsub:user', function(evnt, eventName, response) {
                         *         ...do stuff...
                         *     });
                         */
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast(onName, eventName, response);
                        });
                    }

                    function initializeFactoryListener() {
                        /**
                         * EVENT_CALLER.listeners(name) - returns array of listeners by name
                         */
                        if (EVENT_CALLER.listeners(onName).length === 0) {
                            EVENT_CALLER.on(onName, socketEventCallback);
                            return true;
                        }
                        return false;
                    }

                    function ResourceIO(value) {
                        var self = this;

                        shallowClearAndCopy(value || {}, this);

                        self.$_listeners = {};

                        /**
                         * Re-attach listener
                         *
                         * @return {Function} return off() function for removing listener
                         */
                        self.reatachEventsListener = function() {
                            return $rootScope.$on(onName, function ResourceIOinstanceListener(event, eventName, response) {
                                var _event, _idField;

                                if (events[eventName]) {
                                    _event   = events[eventName];
                                    _idField = _event.idField || 'id';

                                    if ( self[_idField] === response[_idField] ) {

                                        if (_event.fn && typeof _event.fn === 'function') {
                                            _event.fn(self, response);

                                        } else if (eventName === 'remove') {
                                            forEach(self.$_listeners, function(off) {
                                                off();
                                            });
                                        }
                                    }
                                }
                            });
                        }

                        self.$_listeners[onName] = self.reatachEventsListener();
                    }

                    ResourceIO['on'] = function(eventName, cb) {
                        if (!eventName && !cb && this === ResourceIO) {
                            return initializeFactoryListener();

                        } else {
                            if (events[eventName]) {
                                $rootScope.$on(onName, function ResourceIOListener(_event, _eventName, _response) {
                                    if (eventName === _eventName) {
                                        if (events[eventName].isNew) {
                                            cb(new ResourceIO(_response));

                                        } else {
                                            cb(_response);
                                        }
                                    }
                                });
                            }
                        }
                    }

                    /**
                     * A little hack to add an .$off() method to $rootScope to unsubscribe from event
                     * @param  {String}   name Event name
                     * @param  {Function} cb
                     * @return {Void}
                     */
                    ResourceIO['off'] = function() {
                        // removing Angular's listeners
                        if ($rootScope.$$listeners) {
                            if ($rootScope.$$listeners[onName]) {
                                delete $rootScope.$$listeners[onName];
                            }
                        }

                        // removing SocketStream's listeners
                        if (EVENT_CALLER.listeners(onName).length > 0) {
                            EVENT_CALLER.off(onName, socketEventCallback);
                        }
                    }

                    ResourceIO.prototype['on']  = function() {
                        if (this.$_listeners[onName]) {
                            return false;

                        } else {
                            this.$_listeners[onName] = this.reatachEventsListener();
                            return true;
                        }
                    }

                    ResourceIO.prototype['off'] = function() {
                        forEach(this.$_listeners, function(offFunction) {
                            offFunction();
                        });

                        this.$_listeners = {};
                    };

                    forEach(actions, function(action, name) {
                        var isInstanceCall,
                            responseInterceptor,
                            responseErrorInterceptor,
                            value,
                            promise,
                            getter,
                            setter;

                        ResourceIO[name] = function(a1, a2, a3, a4) {
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
                                        "[ngResourceIO->$resourceIO] Expected up to 4 arguments [params, data, success, error], got {0} arguments", arguments.length);
                            }

                            isInstanceCall           = data instanceof ResourceIO;
                            value                    = isInstanceCall ? data : (action.isArray ? [] : new ResourceIO(data));
                            responseInterceptor      = action.interceptor && action.interceptor.response || defaultResponseInterceptor;
                            responseErrorInterceptor = action.interceptor && action.interceptor.responseError || undefined;

                            promise = $socket.rpc( modelName + config.SOCKET_MODEL_METHOD_DELIMITER + name, params ).then(function(response) {
                                var data    = response,
                                    promise = value.$promise;

                                if (data) {
                                    if (angular.isArray(data) !== Boolean(action.isArray)) {
                                        throw $resourceMinErr('badcfg', '[ngResourceIO->$resourceIO] Error in resource configuration. Expected response' +
                                            ' to contain an {0} but got an {1}',
                                            action.isArray ? 'array' : 'object', angular.isArray(data) ? 'array' : 'object');
                                    }
                                    if (action.isArray) {
                                        value.length = 0;
                                        forEach(data, function(item) {
                                            value.push(new ResourceIO(item));
                                        });

                                    } else if (action.isPath && !action.isArray) {
                                        getter = $parse(params);
                                        setter = getter.assign;

                                        if (getter(data)) {
                                            setter(value, getter(data));

                                        } else {
                                            throw $resourceMinErr('badargs',
                                                "[ngResourceIO->$resourceIO] Mismatch in 'isPath' method call! Method '{0}({1})' for object modifying been called. Server sent wrong response: '{2}'",
                                                name, params, JSON.stringify(response));
                                        }
                                    } else {
                                        shallowClearAndCopy(data, value);
                                        value.$promise = promise;
                                    }
                                }
                                value.$resolved = true;
                                response        = value;

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

                        ResourceIO.prototype['$' + name] = function(params, success, error) {
                            if (isFunction(params)) {
                                error = success;
                                success = params;
                                params = {};
                            }
                            var result = ResourceIO[name](params, this, success, error);
                            return result.$promise || result;
                        };
                    });

                    if (!settings.noListeners) {
                        initializeFactoryListener();
                    }

                    return ResourceIO;
                }
                return ResourceIOFactory;
            }
        ]);
})( angular );