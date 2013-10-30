/* Docs
   http://docs.angularjs.org/guide/dev_guide.e2e-testing
 */

describe('app', function() {
    "use strict";

    beforeEach(function() {
        browser().navigateTo('/');
    });

    it('should load index page /', function() {
        expect(browser().location().url()).toBe("/");
        expect(element('[data-ng-view]').text()).toBe('index template');
    });

    it('should load test page /test', function() {
        browser().navigateTo('/test');
        expect(browser().location().url()).toBe("/test");
        expect(element('[data-ng-view]').text()).toBe('test template');
    });
});