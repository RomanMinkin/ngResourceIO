
describe('filter', function(){
	"use strict";
    beforeEach(module('DiggyDoDo'));

    describe('numberToArray', function(){
        it('should create an array with length by given number', inject(function(numberToArrayFilter) {
            // console.log(numberToArrayFilter(3));
            expect(numberToArrayFilter(3)).toEqual([0,1,2]);
        }));
    });
})