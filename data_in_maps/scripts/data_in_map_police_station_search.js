"use strict"

var map;
const ONTARIO_CENTER = {lat: 48.0938427, lng: -86.1100983};
var currentPositionLat, currentPositionLng;

var cityIDArray = [];
var cityNameArray = [];
var cityLatitudeArray = [];
var cityLongitudeArray = [];
var cityZoomArray = [];

var infowindow;
var directionsDisplay;

$(document).ready(function () {

    loadAllCitiesInfo();

    getCurrentPosition();

    // Fill out city list in the webpage. First line is selected by default.
    //
    $.getJSON("./data_source/ontario_geo.json", function (data) {
        var cities = data.cities;

        var _optionCityName;

        for (var i in cities) {
            if (i == 0) {
                _optionCityName += "<option value=" + cities[i].city_id + " selected>" + cities[i].city_name + "</option>";
            } else {
                _optionCityName += "<option value=" + cities[i].city_id + ">" + cities[i].city_name + "</option>";
            }
        }

        $("#city").html(_optionCityName);
    });


    // Fill out crime list in the webpage. First line is selected by default.
    //
    var _optionTravelMode =
        "<option value=\"WALKING\" selected>Walking</option>" +
        "<option value=\"DRIVING\">Driving</option>" +
        "<option value=\"BICYCLING\">Riding Bike</option>";

    $("#travel_mode").html(_optionTravelMode);


    // Fill out crime list in the webpage. First line is selected by default.
    //
    $.getJSON("./data_source/ontario_crime_code.json", function (data) {

        var _offences = data.offences;
        var _optionCrime;

        for (var i in _offences) {
            if (i == 0) {
                _optionCrime += "<option value=" + _offences[i]._OFF + " selected>" + _offences[i]._text + "</option>";
            } else {
                _optionCrime += "<option value=" + _offences[i]._OFF + ">" + _offences[i]._text + "</option>";
            }

        }

        $("#crimeList").html(_optionCrime);
    });
});


// loadAllCitiesInfo() is to initialize 4 global arrays (cityIDArray, cityNameArray, cityLatitudeArray and cityLongitudeArray)
//
function loadAllCitiesInfo() {
    $.getJSON("./data_source/ontario_geo.json", function (data) {
        var cities = data.cities;

        for (var i in cities) {
            cityIDArray[i] = cities[i].city_id;
            cityNameArray[i] = cities[i].city_name;
            cityLatitudeArray[i] = cities[i].geo_center.lat;
            cityLongitudeArray[i] = cities[i].geo_center.lng;
            cityZoomArray[i] = cities[i].zoom;
        }

    });
}

function getCurrentPosition() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            currentPositionLat = pos.lat;
            currentPositionLng = pos.lng;
            console.log(currentPositionLat + " " + currentPositionLng);

        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // If browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}


$("#zhongjie_plot_map").click(function () {

    initOntarioMap();

    var _cityID = $("#city").val();

    searchNearbyPoliceStation(_cityID);
});

function initOntarioMap() {
    map = new google.maps.Map(document.getElementById("map_display"), {
        center: ONTARIO_CENTER,
        zoom: 5,
        zoomControl: true
    });
}

function searchNearbyPoliceStation(_cityID) {

    var _latlng = getCityInfo(_cityID)[0];
    var _cityZoom = getCityInfo(_cityID)[1];

    initCityMap(_latlng, _cityZoom);

    var currentPositionLatLng = new google.maps.LatLng(currentPositionLat, currentPositionLng);

    plotMyCurrentLocation(currentPositionLatLng);

    addPoliceStationMarker(_latlng, _cityZoom);
}


function getCityInfo(_cityID) {
    var _lat, _lng;
    var _cityName;
    var _cityZoom;

    for (var i in cityIDArray) {
        if (_cityID == cityIDArray[i]) {
            _lat = cityLatitudeArray[i];
            _lng = cityLongitudeArray[i];
            _cityName = cityNameArray[i];
            _cityZoom = cityZoomArray[i];
        }
    }
    return [new google.maps.LatLng(_lat, _lng), _cityZoom];
}

function plotMyCurrentLocation(currentPositionLatLng) {

    new google.maps.Marker({
        map: map,
        position: currentPositionLatLng,
        icon: "./images/person_1.png"
    });
}

function addPoliceStationMarker(_latlng, _cityZoom) {

    var searchRadius;

    switch (_cityZoom) {
        case 10:
            searchRadius = 40000;   //40km
            break;
        case 11:
            searchRadius = 20000;   //20km
            break;
        case 12:
            searchRadius = 10000;   //10km
            break;
        case 13:
            searchRadius = 6000;    //6km
            break;
        default:
            searchRadius = 10000;
            break;
    }

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: _latlng,
        radius: searchRadius,
        type: ['police'],
        keyword: ['police service']
    }, nearbySearchCallback);
}


function initCityMap(_latlng, _cityZoom) {
    map = new google.maps.Map(document.getElementById("map_display"), {
        center: _latlng,
        zoom: _cityZoom,
        zoomControl: true
    });
}



function nearbySearchCallback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {

    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: "./images/34x38px-Toronto_Police_Service_Logo.png",
    });

    if (infowindow != null) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name + '<br/><br/><b>Address:</b><br/>' + place.vicinity);
        infowindow.open(map, this);
        setTimeout(function () {
            infowindow.close(map, this)
        }, 4000);

        var currentPositionLatLng = new google.maps.LatLng(currentPositionLat, currentPositionLng);

        plotMyCurrentLocation(currentPositionLatLng);

        var destinationLatLng = place.geometry.location;

        displayDirection(currentPositionLatLng, destinationLatLng);

    });
}

function displayDirection(currentPositionLatLng, destinationLatLng) {

    if (directionsDisplay != null) {
        directionsDisplay.setMap(null);
    }
    var directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;

    directionsDisplay.setMap(map);
    directionsDisplay.setOptions({
        suppressMarkers: true
    });

    calculateAndDisplayRoute(directionsService, directionsDisplay, currentPositionLatLng, destinationLatLng);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, currentPositionLatLng, destinationLatLng) {

    var _travelMode = $("#travel_mode").val();

    directionsService.route({
        origin: currentPositionLatLng,
        destination: destinationLatLng,
        travelMode: google.maps.TravelMode[_travelMode]
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            console.log('Directions request failed due to ' + status);
        }
    });
}
