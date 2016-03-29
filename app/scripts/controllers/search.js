'use strict';

/**
 * @ngdoc function
 * @name earthquakeApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the earthquakeApp
 */
angular.module('earthquakeApp')
  .controller('SearchCtrl', ['$scope', '$http', function($scope, $http) {

  	// Set the end date to todays date (UTC)
  	$scope.endDate = new Date(moment());

  	// Sets the start date to 7 days ago
  	function dateWeek (){
  		$scope.startDate = new Date(moment().add(-7, days))
  	}
  }]);
