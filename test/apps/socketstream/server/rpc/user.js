'use strict';

exports.actions = function(req, res, ss) {
    var users = [
        {id : 1111, name: 'Roman'},
        {id : 2222, name: 'Kolya'},
        {id : 3333, name: 'Vasya'}
    ];

    return {
        find: function() {
            res(null, users);
        },
        findById: function() {
            res(null, users);
        },
        set: function() {
            res(null, users);
        },
        save: function() {
            res(null, users);
        },
        remove: function() {
            res(null, users);
            res(null, {id: users[0].id});
        },

        _callbackEventRemove: function(id) {
            ss.publish.all('pubsub:user', 'remove', id);
            res(null, true);
        },

        _callbackEventSet: function(id, fieldName, newValue) {
            var response = {};

            response['id'] = id;
            response[fieldName] = newValue;

            ss.publish.all('pubsub:user', 'set', response);
            res(null, true);
        }

    };
};