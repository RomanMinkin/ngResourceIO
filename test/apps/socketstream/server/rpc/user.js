'use strict';

exports.actions = function(req, res, ss) {
    var users = [
            {id : 1, name: 'Roman'},
            {id : 2, name: 'Kolya'},
            {id : 3, name: 'Vasya'}
        ],
        newUser = {id : 4, name: 'Petya'};

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
        customAction: function() {
            res(null, users);
        },

        _mockEventNew: function() {
            ss.publish.all('pubsub:user', 'new', newUser);
            res(null, true);
        },

        _mockEventUpdate: function(updatedUser) {
            ss.publish.all('pubsub:user', 'update', updatedUser);
            res(null, true);
        },

        _mockEventSet: function(dataToSet) {
            ss.publish.all('pubsub:user', 'set', dataToSet);
            res(null, true);
        },

        _mockEventRemove: function(user) {
            ss.publish.all('pubsub:user', 'remove', user);
            res(null, true);
        },
        _mockCustomEvent: function(data) {
            ss.publish.all('pubsub:user', 'customEvent', data);
            res(null, true);
        }
    };
};