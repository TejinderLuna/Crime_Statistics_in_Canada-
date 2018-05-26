/**
 * Created by Zhongjie FAN on 2017-07-31.
 */

var OAUTH2_CLIENT_ID = '1032182526967-lpj2lufndc0fbfbd8bl9nn1f1s4shjo4.apps.googleusercontent.com';
var OAUTH2_SCOPES = 'https://www.googleapis.com/auth/youtube';

// Upon loading, the Google APIs JS client automatically invokes this callback.
//
googleApiClientReady = function () {
    gapi.auth.init(function () {
        window.setTimeout(checkAuth, 1);
    });
}


function checkAuth() {
    gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: true,
    }, handleAuthResult);
}

// Handle the result of a gapi.auth.authorize() call.
//
function handleAuthResult(authResult) {

    if (authResult && !(authResult.error == 'immediate_failed')) {

        loadAPIClientInterfaces();

    } else {
        oauth2();
    }
}

function oauth2() {
    gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: false
    }, handleAuthResult);
}

function loadAPIClientInterfaces() {
    gapi.client.load('youtube', 'v3', function () {
        handleAPILoaded();
    });
}