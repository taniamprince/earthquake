'use strict';

angular.module('earthquakeApp')
    .controller('MainCtrl', function() {});

/**
 * @ngdoc controller
 * @name ng.controller:LargestQuakes
 * @requires $scope
 * @requires $http
 * @description
 * When called, it gets the largest earthquakes in the last 7 days, 
 * week, month, year, decade, and century.
 */
angular.module('earthquakeApp').controller('LargestQuakes', ['$scope', '$http', function($scope, $http) {

    $scope.largest = []

    // Calculate start and end dates and minimum magnitude
    // Increasing the magnitude limit speeds up the search query
    if ($scope.param == "today") {
        var start = moment().add(-1, 'days')
        var minMag = 3.5
    } else if ($scope.param == "week") {
        var start = moment().add(-7, 'days')
        var minMag = 4.5
    } else if ($scope.param == "month") {
        var start = moment().add(-1, 'months')
        var minMag = 6
    } else if ($scope.param == "year") {
        var start = moment().add(-1, 'years')
        var minMag = 7.5
    } else if ($scope.param == "decade") {
        var start = moment().add(-10, 'years')
        var minMag = 8
    } else {
        var start = moment().add(-100, 'years')
        var minMag = 8.5
    }
    var end = moment();

    // Construct query url
    var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&limit=1&starttime=" 
        + start.format("YYYY-MM-DD") + "&endtime=" + end.format("YYYY-MM-DD") + '&&minmagnitude=' + minMag

    // Get earthquake data
    $http.get(url)
        .success(function(data, status, headers, config) {
            data.features.map(function(feature) {
                $scope.largest.push("M " + feature.properties.mag, feature.properties.place)
            });
        })
        .error(function(error, status, headers, config) {
            $scope.largest.push("Error: ", "USGS service is unavailable")
            console.log(status)
            console.log("Error occured")
        });
}]);

/**
 * @ngdoc controller
 * @name ng.controller:Tsunami
 * @requires $http
 * @description
 * When called, it gets earthquakes over magnitude 7.5 that have 
 * occurred in a region that could trigger a tsunami.
 */
angular.module('earthquakeApp').controller('Tsunami', ['$http', function($http) {

    var vm = this
    vm.tsunamis = []

    // Adds potetial tsunami to a list of tsunami alerts
    function onEachFeature(feature, layer) {

        // If the tsunami flag is 1 then the earthquake occurred in
        // a region that can generate tsunamis
        if (feature.properties.tsunami == 1) {

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
                        onEachFeature: function(feature, layer) {
                            if (feature.properties.products["impact-link"] != undefined) {
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
            var list = ["Error: ", "USGS service is unavailable", "", ""]
            vm.tsunamis.push(list)
            console.log(status)
            console.log("Error occured")
        });

}]);

/**
 * @ngdoc service
 * @name ng.service:CountService
 * @requires $http
 * @param {String} url - query url
 * @returns {Integer} the number of earthquakes from the given query period
 * @description
 * Gets number of earthquakes from the given query url. Parses result to
 * integer and returns it.
 */
angular.module('earthquakeApp').service('CountService', ['$http', function($http) {
    this.getCount = function(url) {
        var count = $http.get(url).then(function(response) {
            return parseInt(response.data)
        });
        return count
    };
}]);

/**
 * @ngdoc service
 * @name ng.service:UrlService
 * @requires $http
 * @param {String} start - date in ISO8601 Date/Time format
 * @param {String} end - ISO8601 Date/Time format
 * @returns {String} query url
 * @description
 * When called, it constructs and returns a query url which is used
 * to retrieve earthquake counts by the Frequency controller.
 */
angular.module('earthquakeApp').service('UrlService', ['$http', function($http) {
    this.getUrl = function(start, end) {
        return "http://earthquake.usgs.gov/fdsnws/event/1/count?&starttime=" + start.format("YYYY-MM-DD") + "&endtime=" + end.format("YYYY-MM-DD")
    };
}]);

/**
 * @ngdoc controller
 * @name ng.controller:Frequency
 * @requires $http
 * @requires CountService
 * @requires UrlService
 * @description
 * When called, it gets the daily, weekly, and monthly earthquake counts
 * and then populates a highcharts graph with the data.
 */
angular.module('earthquakeApp').controller('Frequency', ['$http', 'CountService', 'UrlService', function($http, CountService, UrlService) {

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
                    $(function() {
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

/**
 * @ngdoc controller
 * @name ng.controller:MapDay
 * @requires $http
 * @description
 * Gets earthquakes over magnitude 4.5 in the last 24 hours and populates
 * leaflet map with earthquake data.
 */
angular.module('earthquakeApp').controller('MapDay', ['$http', function($http) {

    var vm = this
    vm.quakes = []

    function onEachFeature(feature, layer) {
        // Add popup with earthquake information to marker
        var quake = layer.bindPopup("<span class=\"mag\">" + feature.properties.mag + " magnitude </span>" 
            + "<span class=\"time\">" + moment(feature.properties.time).fromNow() + "</span> <br/>" 
            + moment(feature.properties.time).format("dddd, MMMM Do YYYY, h:mm:ss a") + " UTC<br/>"
            + "<span class=\"location\">" + feature.properties.place + "</span>")

        // Add quake to list of quakes
        var list = [moment(feature.properties.time).fromNow(), feature.properties.mag, feature.properties.place]
        vm.quakes.push(list)
    }

    // Initialize map
    var map = L.map('mapDay').setView([30, 0], 1);

    // Get earthquake data
    $http.get('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson')
        .success(function(data, status, headers, config) {
            L.geoJson(data, {
                // Add earthquake informtion to marker popups
                onEachFeature: onEachFeature,
                // Add earthquake magnitude to marker
                pointToLayer: function(feature, latlng) {
                    return L.marker(latlng, {
                        icon: L.AwesomeMarkers.icon({
                            icon: '',
                            prefix: 'fa',
                            markerColor: 'red',
                            html: feature.properties.mag
                        })
                    })
                }
            }).addTo(map);
        })
        .error(function(error, status, headers, config) {
            var list = ["Error: ", "USGS service is unavailable", ""]
            vm.quakes.push(list)
            console.log(status)
            console.log("Error occured")
        });

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        id: 'mapbox.streets'
    }).addTo(map);

}]);