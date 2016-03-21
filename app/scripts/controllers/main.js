'use strict';

//var earthquakeApp = angular.module('earthquakeApp',[])

/**
 * @ngdoc function
 * @name earthquakeApp.controller:LargestQuakes
 * @description
 * # LargestQuakes
 * Returns the largest earthquake for the day, week, month, and year
 */

angular.module('earthquakeApp')
  .controller('MainCtrl', function () {
  });

angular.module('earthquakeApp')
	.controller('LargestQuakes', ['$scope','$http', function($scope, $http) {

	// Calculate start and end dates
  	if ($scope.param == "today") {
	    var start = moment().add(-1, 'days')
	} else if ($scope.param == "week") {
		var start = moment().add(-7, 'days')    
	} else if ($scope.param == "month") {
		var start = moment().add(-1, 'months')	    
	} else {
	    var start = moment().add(-1, 'years')
	}
	var end = moment();

  	// Construct query url
  	var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&limit=1&starttime=" + start.format("YYYY-MM-DD") + "&endtime=" + end.format("YYYY-MM-DD")

  	if ($scope.param == "year") {
  		var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&limit=1&starttime=" + start.format("YYYY-MM-DD") + "&endtime=" + end.format("YYYY-MM-DD") + '&&minmagnitude=7.5'
  	}

  	// Get earthquake data
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

angular.module('earthquakeApp')
.controller('MapDay', ['$scope','$http', function($scope, $http) {

	$scope.quakes = []

	function onEachFeature(feature, layer) {
		// Add popup with earthquake information to marker
	    var quake = layer.bindPopup(feature.properties.title);

	    // Add quake to list of quakes
	    var list = [moment(feature.properties.time).fromNow(), feature.properties.mag, feature.properties.place]
	    $scope.quakes.push(list)
	}

	// Initialize map
	var map = L.map('mapid').setView([0, 0], 1);

	// Get earthquake data
  	$http.get('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson')
	.success(function(data, status, headers, config) {
		L.geoJson(data, {
			// Add earthquake informtion to marker popups
		    onEachFeature: onEachFeature
		,
			// Add earthquake magnitude to marker
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng, {
                    icon: L.AwesomeMarkers.icon({icon: '', prefix: 'fa', markerColor: 'darkblue', html: feature.properties.mag})
                })
            }}).addTo(map);
	})
	.error(function(error, status, headers, config) {
	     console.log(status)
	     console.log("Error occured")
	});

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
      maxZoom: 18, id: 'mapbox.streets'
    }).addTo(map);

}]);