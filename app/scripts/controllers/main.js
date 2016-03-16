'use strict';

var earthquakeApp = angular.module('earthquakeApp',[])

earthquakeApp.controller('largest', ['$scope','$http', function($scope, $http) {
	// Calculate start and end dates
  	var date = new Date()

  	if ($scope.param == "today") {
	    var start = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDate() - 1)
		var end = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
	} else if ($scope.param == "week") {
		var start = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDate() - 7)
		var end = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()	    
	} else if ($scope.param == "month") {
		var start = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()
		var end = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()	    
	} else {
	    var start = (date.getFullYear() - 1) + "-" + date.getMonth() + "-" + date.getDate()
		var end = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
	}

  	// Construct query url
  	var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&limit=1&starttime=" + start + "&endtime=" + end

  	// Get JSON response
  	$http.get(url)
	.success(function(data, status, headers, config) {
		var result = data.features.map(function (feature) {
  			return feature.properties.title
		});
	    $scope.results = result.toString()
	})
	.error(function(error, status, headers, config) {
		 $scope.results = "No data"
	     console.log(status)
	     console.log("Error occured")
	});
}]);