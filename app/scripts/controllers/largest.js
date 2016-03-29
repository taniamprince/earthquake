'use strict';

/**
 * @ngdoc function
 * @name earthquakeApp.controller:LargestCtrl
 * @description
 * # LargestCtrl
 * Controller of the earthquakeApp
 */
angular.module('earthquakeApp')
  .controller('LargestCtrl', function () {

  });

  angular.module('earthquakeApp').controller('Top25', ['$http', function($http) {

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
    var map = L.map('mapTop25').setView([20, 0], 2);

    // Set query url
    var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&limit=25&starttime=1900-01-01" + "&endtime=" + moment().format("YYYY-MM-DD") + '&&minmagnitude=8'

    // Get earthquake data
    $http.get(url)
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
            console.log(status)
            console.log("Error occured")
        });

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        id: 'mapbox.streets'
    }).addTo(map);

}]);
