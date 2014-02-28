/*global angular */
'use strict';

/**
 * Custom assertion for should.js, to be able to compare plain object with angular instances
 *
 * Example:
 *     object.should.be.equalToData
 */
Object.defineProperty(Object.prototype, "equalToData", {
    value: function(expected) {
        return angular.equals(this, expected);
    },
    enumerable: false
})