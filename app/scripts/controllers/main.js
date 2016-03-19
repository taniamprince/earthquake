'use strict';

var earthquakeApp = angular.module('earthquakeApp',[])

/**
 * @ngdoc function
 * @name earthquakeApp.controller:LargestQuakes
 * @description
 * # LargestQuakes
 * Returns the largest earthquake for the day, week, month, and year
 */
earthquakeApp.controller('LargestQuakes', ['$scope','$http', function($scope, $http) {
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

  	// Get and return JSON response
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

earthquakeApp.controller('MapDay', ['$scope','$http', function($scope, $http) {

	function onEachFeature(feature, layer) {
		// Add popup with earthquake information to marker
	    var quake = layer.bindPopup(feature.properties.title);
	}

	// Initialize map
	var map = L.map('mapid').setView([0, 0], 1);

	// Get JSON response
  	$http.get('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson')
	.success(function(data, status, headers, config) {
		L.geoJson(data, {
		    onEachFeature: onEachFeature
		,
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng, {
                    icon: L.AwesomeMarkers.icon({icon: '', prefix: 'fa', markerColor: 'red', html: feature.properties.mag})
                })
            }}).addTo(map);
		//L.geoJson(data.features).addTo(map);
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

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
      maxZoom: 18, id: 'mapbox.streets'
    }).addTo(map);

    var popup = L.popup();

    function onMapClick(e) {
      popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
    }

    map.on('click', onMapClick);

}]);