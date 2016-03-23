'use strict';

describe('Controller: LargestCtrl', function () {

  // load the controller's module
  beforeEach(module('earthquakeApp'));

  var LargestCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LargestCtrl = $controller('LargestCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(LargestCtrl.awesomeThings.length).toBe(3);
  });
});
