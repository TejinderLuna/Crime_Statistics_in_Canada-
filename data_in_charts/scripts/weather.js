var mainWeather = {
    init: function() {
        $("#submitWeather").click(function() {
            return mainWeather.getWeather();
        });
    },

    getWeather: function() {
        $.get('http://api.openweathermap.org/data/2.5/weather?q=' + $("#cityInput").val() + "," + $("#countryInput").val() + "&APPID=ac3c68ebb846b2128d7b719c7b9c8b28", function(data) {
            console.log(JSON.stringify(data));
            console.log(data);
            console.log((data.main.temp - 273.15).toFixed(2));
            console.log(data.weather[0].main);
            console.log(data.weather[0].description);
            console.log(data.wind.speed);
            console.log(data.main.humidity);
            console.log(data.main.pressure);
            console.log(data.name);
            console.log(data.sys.country);
            putdata(data)
        });
    },


};
function putdata(data)
{
    var result="";
    var img="<img src='http://openweathermap.org/img/w/"+data.weather[0].icon+".png'>"
    result+="<table>"+"<tr>"+"<td><b>STATE &nbsp;</b></td>"+"<td>"+data.name+","+data.sys.country+"</td>"+"</tr>"+
        "<tr>"+"<td><b>TEMP &nbsp;</b></td>"+"<td>"+(data.main.temp - 273.15).toFixed(2)+"&deg;C</td>"+"</tr>"+
        "<tr>"+"<td><b>MAIN &nbsp;</b></td>"+"<td>"+data.weather[0].main+"</td>"+"</tr>"+
        "<tr>"+"<td><b>WEATHER &nbsp;</b></td>"+"<td>"+data.weather[0].description+img+"</td>"+"</tr>"+
        "<tr>"+"<td><b>SPEED &nbsp;</b></td>"+"<td>"+data.wind.speed+"m/sec</td>"+"</tr>"+
        "<tr>"+"<td><b>HUMIDITY &nbsp;</b></td>"+"<td>"+data.main.humidity+"&percnt;</td>"+"</tr>"+
        "<tr>"+"<td><b>PRESSURE &nbsp;</b></td>"+"<td>"+data.main.pressure+"hPa</td>"+"</tr>"+
        "</table>";
    console.log(result);
    document.getElementById('weatherWrapper').innerHTML=result;
}
$(document).ready(function(){
    mainWeather.init();
});


