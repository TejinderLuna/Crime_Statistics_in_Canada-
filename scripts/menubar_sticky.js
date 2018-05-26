/**
 * Created by Zhongjie FAN on 2017-08-09.
 */

$(document).ready(function () {

    var menubar = $('#menu-bar');
    var origOffsetY = menubar.offset().top;

    function scroll() {
        if ($(window).scrollTop() >= origOffsetY) {
            $('.navbar').addClass('navbar-fixed-top');
        } else {
            $('.navbar').removeClass('navbar-fixed-top');
        }
    }
    document.onscroll = scroll;
});