"use strict"

var map;
var whiteStyledMapType, normalStyledMapType;
var toggleMapstyleButtonClickCount = 0;

const ONTARIO_CENTER = {lat: 48.0938427, lng: -86.1100983};

var cityIDArray = [];
var cityNameArray = [];
var cityLatitudeArray = [];
var cityLongitudeArray = [];

// In order to close any infoWindow on the map, I declared infoWindow as global variable.
var infoWindow;

$(document).ready(function () {

    // When webpage gets loaded, fill out two select option lists programmatically
    //
    // By calling loadCityInfo(), array cityIDArray, cityNameArray, cityLatitudeArray and cityLongitudeArray will be
    // loaded with values from file "ontario_geo.json"
    //
    loadAllCitiesInfo();

    var _optionYear;
    const START_YEAR = 1983;
    const END_YEAR = 2000;

    // Fill out year list in the webpage. First line is selected by default.
    //
    for (var i = START_YEAR; i <= END_YEAR; i++) {
        if (i == START_YEAR) {
            _optionYear += "<option value=" + i + " selected>" + i + "</option>";
        } else {
            _optionYear += "<option value=" + i + ">" + i + "</option>";
        }

    }

    $("#year").html(_optionYear);

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
        var _cities = data.cities;
        // console.log("city length: " + cities.length);

        for (var i in _cities) {
            cityIDArray[i] = _cities[i].city_id;
            cityNameArray[i] = _cities[i].city_name;
            cityLatitudeArray[i] = _cities[i].geo_center.lat;
            cityLongitudeArray[i] = _cities[i].geo_center.lng;
        }

    });
}

// When user click "Plot Map" button, call click() function
//
$("#zhongjie_plot_map").click(function () {

    initOntarioMap();

    // Get selected year and crime type from list in webpage.
    //
    var _selectedYear = $("#year").val();
    var _selectedCrimeType = $("#crimeList").val();

    plotMap(_selectedYear, _selectedCrimeType);
});


function plotMap(_selectedYear, _selectedCrimeType) {

    $.getJSON("./data_source/ontario_crime_volume.json", function (data) {

        // Array _crimeVolumeArray, _latlngArray and _cityNameArray are parallelled array.
        //
        var _crimeVolume;
        var _crimeVolumeArray = [];
        var _latlng;
        var _latlngArray = [];
        var _cityID;
        var _cityName;
        var _cityNameArray = [];

        var series = data.series;

        // Loop through the json data, firstly to match the crime code
        //
        for (var i in series) {
            // console.log(series[i]._OFF);
            if (series[i]._OFF == _selectedCrimeType) {

                // If crime code matches, then to match the year in a Obs element
                //
                for (var j in series[i].Obs) {

                    if (series[i].Obs[j]._TIME_PERIOD == _selectedYear) {

                        // Fill out parallelled arrays. _crimeVolume should be converted into integer.
                        //
                        _crimeVolume = series[i].Obs[j]._OBS_VALUE;
                        _crimeVolumeArray.push(parseInt(_crimeVolume));
                        _cityID = series[i]._CITY;

                        _latlng = getCityInfo(_cityID)[0];
                        _latlngArray.push(_latlng);

                        _cityName = getCityInfo(_cityID)[1];
                        _cityNameArray.push(_cityName);

                        break;
                    }
                }
            }
        }


        // In order to make the big circle plotted at first, I have to sort array in descending order.
        // So that when clicking some small circles which are overlapped with big circle, the small circle still can response.
        //
        // Sort _crimeVolumeArray in DESCENDING order
        // And modify the sequence of elements in _latlngArray and _cityNameArray accordingly
        //
        // Note: cannot use sort() method for sorting parallelled arrays
        //
        for (var i = 0; i < _crimeVolumeArray.length - 1; i++) {
            for (var j = i + 1; j < _crimeVolumeArray.length; j++) {

                if (parseInt(_crimeVolumeArray[i]) < parseInt(_crimeVolumeArray[j])) {

                    var temp = _crimeVolumeArray[i];
                    _crimeVolumeArray[i] = _crimeVolumeArray[j];
                    _crimeVolumeArray[j] = temp;

                    temp = _latlngArray[i];
                    _latlngArray[i] = _latlngArray[j];
                    _latlngArray[j] = temp;

                    temp = _cityNameArray[i];
                    _cityNameArray[i] = _cityNameArray[j];
                    _cityNameArray[j] = temp;
                }
            }
        }

        var maxVolumeCrime = _crimeVolumeArray[0];

        // Add circles on the map based on the sorted parallelled arrays
        //
        for (var i = 0; i < _crimeVolumeArray.length; i++) {

            addCircleOnMap(_latlngArray[i], _crimeVolumeArray[i], _cityNameArray[i], _selectedCrimeType, maxVolumeCrime);
        }

    });

}

// By searching the global arrays, return coordinates and cityName based on the given cityID
//
function getCityInfo(_cityID) {
    var _lat, _lng;
    var _cityName;

    for (var i in cityIDArray) {
        if (_cityID == cityIDArray[i]) {
            _lat = cityLatitudeArray[i];
            _lng = cityLongitudeArray[i];
            _cityName = cityNameArray[i];
        }
    }
    return [new google.maps.LatLng(_lat, _lng), _cityName];
}


function addCircleOnMap(_latlng, _crimeVolume, _cityName, _selectedCrimeType, _maxVolumeCrime) {

    var _radius = _crimeVolume * 100 / _maxVolumeCrime;

    // Instantiate a circle on map
    //
    var _newCircle = new google.maps.Circle({
        strokeColor: '#FFFFFF',
        strokeOpacity: 0.5,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.25,
        center: _latlng,
        radius: _radius * 1000
    });
    _newCircle.setMap(map);

    // Add _newCircle object a click event listener. It will show city name and crimevolume.
    //
    _newCircle.addListener('click', function () {

        // Firstly, remove all the infoWindow on the map
        //
        if (infoWindow) {
            infoWindow.close();
        }

        // Instantiate an infoWindow for a certain circle
        //
        infoWindow = new google.maps.InfoWindow({
            content: _cityName + "<br/>Crime Volume: " + _crimeVolume
        });

        // Debug output
        //
        // console.log(_newCircle.getRadius() + ' latlng: ' + _latlng + ' crimeType: ' + _selectedCrimeType);

        infoWindow.setPosition(_newCircle.getCenter());
        infoWindow.open(map);
    });

}

// Callback function. It will be called at last <script> line in the body section in data_in_map_circles.html
//
function initOntarioMap() {

    whiteStyledMapType = new google.maps.StyledMapType(
        [
            {
             'stylers': [{'visibility': 'off'}]
            }, {
            'featureType': 'landscape',
            'elementType': 'geometry',
            'stylers': [{'visibility': 'on'}, {'color': '#fcfcfc'}]
        }, {
            'featureType': 'water',
            'elementType': 'geometry',
            'stylers': [{'visibility': 'on'}, {'color': '#bfd4ff'}]
        }
        ]
    );

    normalStyledMapType = new google.maps.StyledMapType(
        [
            {
                "featureType": "landscape"
            }
        ]
    );

    map = new google.maps.Map(document.getElementById("map_display"), {
        center: ONTARIO_CENTER,
        zoom: 5,
        zoomControl: true,
        styles: null
    });
}

$("#zhongjie_toggle_mapstyle").click(function () {

    if (map != null) {
        if (toggleMapstyleButtonClickCount % 2 == 0) {
            map.mapTypes.set('white_styled_map', whiteStyledMapType);
            map.setMapTypeId('white_styled_map');
            console.log(111);

        } else {
            // removing style will go back to normal map
            map.mapTypes.set('normal_styled_map', normalStyledMapType);
            map.setMapTypeId('normal_styled_map');
            console.log(222);
        }
        toggleMapstyleButtonClickCount++

    } else {
        Console.log("Map is not generated.");
    }

});