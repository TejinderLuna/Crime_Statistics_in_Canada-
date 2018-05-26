/**
 * Created by Zhongjie FAN on 2017-07-31.
 */

var crimeName;
var q;
var videoSearchdivHeight;
const eachTableCellHeight = 96;
const maxResultsPerPage = 8;
const videoSearchDelay = 3500;

function handleAPILoaded() {

    $('#search_youtube').attr('disabled', false);
}

$(document).ready(function () {

    // Fill out crime list in the webpage. First line is selected by default.
    //
    $.getJSON("./data_source/crime_keywords.json", function (data) {

        var _offences = data.offences;
        var _optionCrime;

        for (var i in _offences) {
            if (i == 0) {
                _optionCrime += "<option selected>" + _offences[i]._text + "</option>";
            } else {
                _optionCrime += "<option>" + _offences[i]._text + "</option>";
            }
        }

        $("#crimeList").html(_optionCrime);

    });


    function initVideoSearchList() {
        q = "prevent crime";
        search(q);
    }

    setTimeout(initVideoSearchList, videoSearchDelay);
});


$("#search_youtube").click(function () {
    crimeName = $("#crimeList").find(":selected").text();
    crimeName = "prevent " + crimeName
    console.log(crimeName);

    q = crimeName;
    search(q);
});

// Search for a specified string.
//
function search(q) {

    // after token and q get value, clear div
    $('#video_search_result').empty();
    $('#video_nav_buttons').empty();

    var request = gapi.client.youtube.search.list({
        q: q,
        part: 'snippet',
        type: 'video',
        maxResults: maxResultsPerPage,
        order: 'viewCount',
        publishedAfter: '2000-01-01T00:00:00Z'
    });

    request.execute(function (response) {

        var nextPageToken = response.nextPageToken;
        var prevPageToken = response.prevPageToken;

        var results = response.result;

        // eachTableCellHeight is the height of each item.
        //
        videoSearchdivHeight = eachTableCellHeight * results.items.length;
        $('#video_search_result').css({"height": videoSearchdivHeight + "px"});

        $.each(results.items, function (index, item) {

            var output = getOutput(item);
            $('#video_search_result').append(output);
        });

        var buttons = getButtons(prevPageToken, nextPageToken, results.items.length);

        $('#video_nav_buttons').append(buttons);
    });
}

function getOutput(item) {
    var videoId = item.id.videoId;
    var title = item.snippet.title;
    var description = item.snippet.description;
    var thumb = item.snippet.thumbnails.medium.url;
    var channelTitle = item.snippet.channelTitle;
    var videoDate = item.snippet.publishedAt;

    videoDate = String(videoDate);
    videoDate = videoDate.replace("T", " ");
    videoDate = videoDate.replace(".000Z", "");


    var output = '<table>' +
        '<td><a href="#" onclick="displayVideo(\'' + videoId + '\', \'' + channelTitle + '\', \'' + videoDate + '\')"><img src="' + thumb + '" width="160" height="90"/></a></td>' +
        '<td><h5><a href="#" onclick="displayVideo(\'' + videoId + '\', \'' + channelTitle + '\', \'' + videoDate + '\')">' + title + '</a></h5><p>By ' + channelTitle + '</p></td>' +
        '</table>';
    console.log(output);
    return output;

}

function displayVideo(videoId, channelTitle, videoDate) {
    console.log(videoId + ' ' + channelTitle + ' ' + videoDate);

    $("#video_display").empty();

    var videoWidth = 780;
    var videoHeight = 435;
    var videoSrc = "https://www.youtube.com/embed/" + videoId;

    var videoIframe = document.createElement("iframe");
    videoIframe.setAttribute("width", "100%");
    videoIframe.setAttribute("height", "auto");
    videoIframe.setAttribute("src", videoSrc);
    videoIframe.setAttribute("frameborder", 0);

    $("#video_display").append(videoIframe);

    displayVideoInfo(videoSrc, channelTitle, videoDate)
}

function displayVideoInfo(videoSrc, channelTitle, videoDate) {

    $("#video_info").empty();

    var infoDisplay = '<p><b>By: </b>' + channelTitle + '</p>' +
        '<p><b>Published at: </b>' + videoDate + '</p>' +
        '<a href="' + videoSrc + '" target="_blank"><b>Link: </b>' + videoSrc + '</a>';


    $("#video_info").append(infoDisplay);
}

function nextPage() {

    // use token and query, not data-token and data-query
    var token = $('#next-button').data('token');
    var q = $('#next-button').data('query');


    // after token and q get value, clear div
    $('#video_search_result').empty();
    $('#video_nav_buttons').empty();


    var request = gapi.client.youtube.search.list({
        q: q,
        pageToken: token,
        part: 'snippet',
        type: 'video',
        maxResults: maxResultsPerPage,
        order: 'viewCount',
        publishedAfter: '2015-01-01T00:00:00Z'
    });


    request.execute(function (response) {
        // console.log(response);
        // var str = JSON.stringify(response.result);
        // $('#search-container').html('<pre>' + str + '</pre>');

        var nextPageToken = response.nextPageToken;
        var prevPageToken = response.prevPageToken;

        var results = response.result;

        // 103 is the height of each item. 10 is an additional height.
        videoSearchdivHeight = eachTableCellHeight * results.items.length;
        $('#video_search_result').css({"height": videoSearchdivHeight + "px"});

        $.each(results.items, function (index, item) {

            var output = getOutput(item);
            $('#video_search_result').append(output);
        });

        var buttons = getButtons(prevPageToken, nextPageToken, results.items.length);

        $('#video_nav_buttons').append(buttons);
    });
}

function prevPage() {

    // use token and query, not data-token and data-query
    var token = $('#prev-button').data('token');
    var q = $('#prev-button').data('query');

    // after token and q get value, clear div
    $('#video_search_result').empty();
    $('#video_nav_buttons').empty();

    var request = gapi.client.youtube.search.list({
        q: q,
        pageToken: token,
        part: 'snippet',
        type: 'video',
        maxResults: maxResultsPerPage,
        order: 'viewCount',
        publishedAfter: '2015-01-01T00:00:00Z'
    });


    request.execute(function (response) {

        var nextPageToken = response.nextPageToken;
        var prevPageToken = response.prevPageToken;

        var results = response.result;

        // eachTableCellHeight is the height of each item.
        //
        videoSearchdivHeight = eachTableCellHeight * results.items.length;
        $('#video_search_result').css({"height": videoSearchdivHeight + "px"});

        $.each(results.items, function (index, item) {

            var output = getOutput(item);
            $('#video_search_result').append(output);
        });

        var buttons = getButtons(prevPageToken, nextPageToken, results.items.length);

        $('#video_nav_buttons').append(buttons);
    });
}


function getButtons(prevPageToken, nextPageToken, searchResultLength) {

    var btnOutput;

    if (searchResultLength > (maxResultsPerPage - 1)) {
        if (!prevPageToken) {
            btnOutput = '<div class="button-container">' +
                '<button id="next-button" class="btn btn-info" data-token="' + nextPageToken + '" data-query="' + q + '" onclick="nextPage();">Next Page</button>' +
                '</div>';
        } else {
            btnOutput = '<div class="button-container">' +
                '<button id="prev-button" class="btn btn-info" data-token="' + prevPageToken + '" data-query="' + q + '" onclick="prevPage();">Prev Page</button>' +
                '<button id="next-button" class="btn btn-info" data-token="' + nextPageToken + '" data-query="' + q + '" onclick="nextPage();">Next Page</button>' +
                '</div>';
        }
    } else {
        btnOutput = "";
    }

    return btnOutput;
}