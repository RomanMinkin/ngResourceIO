/* Docs
   http://docs.angularjs.org/guide/dev_guide.e2e-testing
 */

describe('app', function() {
    "use strict";

    beforeEach(function() {
        try {
            browser().navigateTo('/');

        } catch(e) {
            console.log('e', e);
        }
        // sleep(1);
    });


    it('should load index page /', function() {
        expect(browser().location().url()).toBe("/");
        expect(element('[data-ng-view]').text()).toBe('index template');
    });


    // describe('/', function() {

    //     beforeEach(function() {
    //         browser().navigateTo('/login');
    //     });


    //     it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
    //         expect(browser().location().url()).toBe("/login");
    //     });

        // it('should render view1 when user navigates to /view1', function() {
        // expect(element('[ng-view] p:first').text()).
        //       toMatch(/partial for view 1/);
        //   });

        // });


        // describe('view2', function() {

        //   beforeEach(function() {
        //     browser().navigateTo('#/view2');
        //   });


        //   it('should render view2 when user navigates to /view2', function() {
        //     expect(element('[ng-view] p:first').text()).
        //       toMatch(/partial for view 2/);
        //   });

    // });
});