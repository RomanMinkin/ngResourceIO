"use strict";

exports.actions = function(req, res, ss) {
    var obj = {id : 1111, name: 'Roman'},
        obj2 = {id : 2222, name: 'Kolya'},
        obj3 = {id : 3333, name: 'Vasya'};
    // return list of actions which can be called publicly


    // setInterval(function(){
    //     ss.publish.all('pubsub:test:set', { data: {id: 3333, name: 'Ulya Pokrova'}});
    // }, 10000);

    return {
        find: function() {
            res(null, 1111);
        },
        findById: function() {
            res(null, {data: obj});
        },
        set: function() {
            obj.location = {
                address: 'New York'
            };
            res(null, {
                data: {
                    'name': obj.location.address
                    // location: {
                    //     address: obj.location.address
                    // }
                }
            });
        },
        save: function() {
            obj.name = 'Saved';
            res(null, {data: obj});
        },
        remove: function() {
            res(null, {data: {id: obj.id}});
        },

    };
};