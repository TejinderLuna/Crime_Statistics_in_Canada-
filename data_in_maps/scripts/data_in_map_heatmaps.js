/**
 * Created by Zhongjie FAN on 2017-07-28.
 */
"use strict"

var map;
var heatmap;
var ontarioCenter = {lat: 46.4185155, lng: -85.0587619};
const HeatmapLayerRadius = 0.8;

var cityID = [];
var cityName = [];
var cityLatitude = [];
var cityLongitude = [];


$(document).ready(function () {

    $("#heatmap_legend").hide();

    loadCityInfo();

    var resultYear = "";

    const START_YEAR = 1983;
    const END_YEAR = 2000;

    for (var i = START_YEAR; i <= END_YEAR; i++) {
        if(i == START_YEAR) {
            resultYear += "<option value=" + i + " selected>" + i + "</option>";
        } else {
            resultYear += "<option value=" + i + ">" + i + "</option>";
        }

    }
    $("#year").html(resultYear);

    $.getJSON("./data_source/ontario_crime_code.json", function (data) {
        // console.log(data.offences.length);
        var offences = data.offences;
        var resultCrime;

        for (var i in offences) {
            if(i == 0) {
                resultCrime += "<option value=" + offences[i]._OFF + " selected>" + offences[i]._text + "</option>";
            }else {
                resultCrime += "<option value=" + offences[i]._OFF + ">" + offences[i]._text + "</option>";
            }

        }
        $("#crimeList").html(resultCrime);
    });
});


$("#zhongjie_plot_map").click(function () {

    initOntarioMap();

    var selectedYear = $("#year").val();
    var selectedCrimeType = $("#crimeList").val();

    plotHeatmap(selectedYear, selectedCrimeType)

});


function initOntarioMap() {
    map = new google.maps.Map(document.getElementById("map_display"), {
        center: ontarioCenter,
        zoom: 5,
        zoomControl: true
    });
}


function plotHeatmap(selectedYear, selectedCrimeType) {

    $.getJSON("./data_source/ontario_crime_volume.json", function (data) {

        var series = data.series;

        var crimeVolume;
        var crimeVolumeArray = [];
        var city;
        var heatmapData = [];
        var weight;

        for (var i in series) {
            if (series[i]._OFF == selectedCrimeType) {

                for (var j in series[i].Obs) {
                    if (series[i].Obs[j]._TIME_PERIOD == selectedYear) {

                        crimeVolume = series[i].Obs[j]._OBS_VALUE;
                        crimeVolume = parseInt(crimeVolume);
                        crimeVolumeArray.push(crimeVolume);

                        city = series[i]._CITY;

                        var latlng = getLatLng(city);

                        weight = getHeatmapWeight(crimeVolume);

                        var heatmapDataItem = {location: latlng, weight: weight};
                        heatmapData.push(heatmapDataItem);
                        break;
                    }
                }
            }
        }


        heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            dissipating: false,
            radius: HeatmapLayerRadius
        });
        heatmap.setMap(map);

        // sort array to get max and min crime volume
        //
        crimeVolumeArray.sort(function (a, b) {
            return a - b;
        });

        $("#heatmap_legend").show();

        $("#crimevolume-max").empty();
        $("#crimevolume-min").empty();
        $("#crimevolume-max").html("Crime volume (Max): <b>" + crimeVolumeArray[crimeVolumeArray.length - 1] + "</b>");
        $("#crimevolume-min").html("Crime volume (Min): <b>" + crimeVolumeArray[0] + "</b>");

    });
}

function getHeatmapWeight(crimeVolume) {

    var weight = 0.1;
    while(crimeVolume > 5) {
        crimeVolume /= 5;
        weight += 0.1;
    }

    return weight;
}

function getLatLng(city) {
    var lat, lng;

    for (var i in cityID) {
        if (city == cityID[i]) {
            lat = cityLatitude[i];
            lng = cityLongitude[i];
        }
    }
    return new google.maps.LatLng(lat, lng);
}


function loadCityInfo() {
    $.getJSON("./data_source/ontario_geo.json", function (data) {
        var cities = data.cities;
        // console.log("city: " + cities.length);

        for (var i in cities) {
            cityID[i] = cities[i].city_id;
            cityName[i] = cities[i].city_name;
            cityLatitude[i] = cities[i].geo_center.lat;
            cityLongitude[i] = cities[i].geo_center.lng;
        }

    });

}

$("#zhongjie_toggleHeatmap").click(function () {
    heatmap.setMap(heatmap.getMap() ? null : map);
});


$("#zhongjie_changeHeatmapGradient").click(function () {
        var gradient = [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ]
        heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
});


$("#zhongjie_changeOpacity").change(function () {

    var opacityValue = $("#zhongjie_changeOpacity").val();

    heatmap.set('opacity', opacityValue);
});
