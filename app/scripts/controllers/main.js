'use strict';

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

	$scope.largest = []

	// Calculate start and end dates
  	if ($scope.param == "today") {
	    var start = moment().add(-1, 'days')
	} else if ($scope.param == "week") {
		var start = moment().add(-7, 'days')    
	} else if ($scope.param == "month") {
		var start = moment().add(-1, 'months')	    
	} else if ($scope.param == "year"){
	    var start = moment().add(-1, 'years')
	} else {
		var start = moment().add(-10, 'years')
	}
	var end = moment();

  	// Construct query url
  	var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&limit=1&starttime=" + start.format("YYYY-MM-DD") + "&endtime=" + end.format("YYYY-MM-DD")

  	if ($scope.param == "year" || $scope.param == "decade") {
  		var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&limit=1&starttime=" + start.format("YYYY-MM-DD") + "&endtime=" + end.format("YYYY-MM-DD") + '&&minmagnitude=7.5'
  	}

  	// Get earthquake data
  	$http.get(url)
	.success(function(data, status, headers, config) {
		data.features.map(function (feature) {
  			$scope.largest.push(feature.properties.mag, feature.properties.place)
		});
	})
	.error(function(error, status, headers, config) {
		$scope.largest.push("", "")
	    console.log(status)
	    console.log("Error occured")
	});
}]);


angular.module('earthquakeApp')

	// Gets and returns earthquake count from url
	.service('CountService', ['$http', function ($http) {
        this.getCount = function (url) {
        	var count = $http.get(url).then(function (response) {
	        return parseInt(response.data)
	      	});
	      return count
        };
    }])

    // Constructs and returns query url from given start and end dates
	.service('UrlService', ['$http', function ($http) {
        this.getUrl = function (start, end) {
	      return "http://earthquake.usgs.gov/fdsnws/event/1/count?&starttime=" + start.format("YYYY-MM-DD") + "&endtime=" + end.format("YYYY-MM-DD")
        };
    }])

	// Gets earthquake counts and populates highcharts data
	.controller('Frequency', ['$http', 'CountService', 'UrlService', function($http, CountService, UrlService) {

	// Calculate end date
	var end = moment();

	// Calculate start date and get daily earthquake count url
	var start = moment().add(-1, 'days')
	var dailyUrl = UrlService.getUrl(start, end)
	
	// Calculate start date and get weekly earthquake count url
	start = moment().add(-7, 'days')
	var weeklyUrl = UrlService.getUrl(start, end)

	// Calculate start date and get monthly earthquake count url
	start = moment().add(-1, 'months')
	var monthlyUrl = UrlService.getUrl(start, end)

	// Populate highchart data
	count()

	function count() {
        CountService.getCount(dailyUrl).then(function(day) {
            CountService.getCount(weeklyUrl).then(function(week) {
            	CountService.getCount(monthlyUrl).then(function(month) {
        			$(function () { 
					    $('#freq').highcharts({
					        chart: {
					            type: 'bar',
					        },
					        title: {
					            text: ''
					        },
					        xAxis: {
					            categories: ['']
					        },
					        yAxis: {
					            title: {
					                text: ''
					            }
					        },
					        credits: {
					            enabled: false
					        },
					        plotOptions: {
					            bar: {
					                dataLabels: {
					                    enabled: true
					                }
					            },
					            series: {
					              pointPadding: 0,
					              groupPadding: 0
					          }
					        },
					        tooltip: { 
					            enabled: false 
					        },
					        series: [{
					            name: 'Day',
					            data: [day]
					        }, {
					            name: 'Week',
					            data: [week]
					        }, {
					            name: 'Month',
					            data: [month]
					        }]
					    });
					});
	        	});
	        });
        });
    }  
}]);

angular.module('earthquakeApp')
.controller('MapDay', ['$http', function($http) {

	var vm = this
	vm.quakes = []

	function onEachFeature(feature, layer) {
		// Add popup with earthquake information to marker
	    var quake = layer.bindPopup(feature.properties.title + "<br>" + "test")

	    // Add quake to list of quakes
	    var list = [moment(feature.properties.time).fromNow(), feature.properties.mag, feature.properties.place]
	    vm.quakes.push(list)
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
                    icon: L.AwesomeMarkers.icon({icon: '', prefix: 'fa', markerColor: 'red', html: feature.properties.mag})
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

angular.module('earthquakeApp')
.controller('Tsunami', ['$http', function($http) {

	var vm = this
	vm.tsunamis = []

	// Adds potetial tsunami to a list of tsunami alerts
	function onEachFeature(feature, layer) {

	    // If the tsunami flag is 1 then the earthquake occurred in
	    // a region that can generate tsunamis
	    if (feature.properties.tsunami == 1){

	    	// Get PAGER alert level. This indicates fatality and economic loss 
	    	// impact estimates following significant earthquakes worldwide. 
	    	// If the alert level is orange or red then a tsunami is highly likely.
	    	var alert = feature.properties.alert

	    	// Calculate how long ago the quake occurred
	    	var time = moment(feature.properties.time).fromNow()

	    	// Get magnitude
	    	var magnitude = feature.properties.mag

	    	// Get location
	    	var location = feature.properties.place

	    	// Get more details. The detail property contains a url to another JSON object
	    	// which contains detailed information about a single earthquake.
	    	$http.get(feature.properties.detail)
				.success(function(data, status, headers, config) {
					L.geoJson(data, {
				    	onEachFeature: function (feature, layer) {
				    			if (feature.properties.products["impact-link"] != undefined){
				    				console.log(feature.properties.products["impact-link"][0].properties.text)
				    			}
				    		}
				    })
				})
				.error(function(error, status, headers, config) {
				     console.log(status)
				     console.log("Error occured")
				});

	    	// Add tsunami properties to list
	    	var list = [alert, time, magnitude, location]
	    	vm.tsunamis.push(list)
	    }
	}

	// Calculate start and end dates
	var start = moment().add(-1, 'years')
	var end = moment()

	// Construct query url
	var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&limit=20&minmagnitude=7.5&starttime=" + start.format("YYYY-MM-DD") + "&endtime=" + end.format("YYYY-MM-DD")

	// Get tsunami data
  	$http.get(url)
	.success(function(data, status, headers, config) {
		L.geoJson(data, {
		    onEachFeature: onEachFeature
            });
	})
	.error(function(error, status, headers, config) {
	     console.log(status)
	     console.log("Error occured")
	});

}]);