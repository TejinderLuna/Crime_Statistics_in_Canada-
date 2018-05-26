var crimes;
var crimesarray;
const maxindex =14;
const constantstate="Canada";
$(document).ready(function () {
    console.log("jquery working");

    $("#playvideohere").hide();

    $.getJSON('data_source/new.json', function (data) {
        console.log(data);
        crimes=data;
        crimesarray = data.crimesbyprovinces;
        console.log(crimesarray);
        var result = "<option selected>Select an option</option>";
        $.each(crimesarray, function (index,cr) {
                if(index < maxindex)
                {
                    result += "<option>" + cr.Statistics + "</option>"
                }
                else
                {
                    return false;
                }

        });
        $('#stats').html(result);
    });
    $.getJSON('data_source/provinces.json', function (data) {
        console.log(data);
        //crimes=data;
        provinceary = data.provincearray;
        console.log(provinceary);
        var result = "<option selected>Select an option</option>";
        $.each(provinceary, function (index,cr) {

                result += "<option>" + cr.province + "</option>"


        });
        $('#provinces').html(result);
    });
});
var province;
function generate_chart()
{
    var e = document.getElementById("provinces");
     province = e.options[e.selectedIndex].text;
    var e1= document.getElementById("year");
    var year = e1.options[e1.selectedIndex].text;
    var e2= document.getElementById("stats");
    var stat = e2.options[e2.selectedIndex].text;
    var chrt = $('input[name=chart_type]:checked').val();
    if(chrt === "area_chart")
    {
        if (stat === "Select an option") {
            document.getElementById("statsarea").innerHTML = "select some statistic";
        }
        else
        {
            document.getElementById("statsarea").innerHTML = "";
             $.each(crimesarray, function (index,cr) {
             if(cr.Statistics === stat && cr.Geography === constantstate )
             {
                 google.charts.load('current', {
                     'packages':['geochart'],
                     'mapsApiKey': 'AIzaSyC6XnYz7neCA3a4UPV2cx-zapUKxCBOGyw'
                 });
                 google.charts.setOnLoadCallback(drawRegionsMap);

                 function drawRegionsMap() {
                     var data = google.visualization.arrayToDataTable([
                         ['Country', stat],
                         ['Canada', cr.year2016],
                         ['China', 10083 ],
                         ['India',41623],
                         ['Pakistan',13846],
                         ['Russia',16232],
                         ['United states',15696],
                         ['South Africa',18673],
                         ['Namibia',388],
                         ['Guinea',1067]
                     ]);

                     var options = {
                         colorAxis: {colors: ['#00853f', 'black', '#e31b23']},
                         backgroundColor: '#81d4fa',
                         datalessRegionColor: '#f8bbd0',
                         defaultColor: '#f5f5f5',
                     };
                     var chart = new google.visualization.GeoChart(document.getElementById('chart_display'));
                     chart.draw(data, options);
                 }
                 return false;
             }

             });
        }

    }
    else {

        if (province === "Select an option") {
            document.getElementById("provincearea").innerHTML = "select some province";
        }
        else if (year === "Select an option") {
            document.getElementById("yeararea").innerHTML = "select ALL";
        }
        else if (stat === "Select an option") {
            document.getElementById("statsarea").innerHTML = "select some statistic";
        }
        else {
            document.getElementById("provincearea").innerHTML = "";
            document.getElementById("yeararea").innerHTML = "";
            document.getElementById("statsarea").innerHTML = "";
            $.each(crimesarray, function (index, cr) {
                if (cr.Geography === province && cr.Statistics === stat) {
                    if (chrt === "column_chart") {
                        google.charts.load('current', {'packages': ['bar']});
                        google.charts.setOnLoadCallback(drawChart);
                        function drawChart() {
                            var data = google.visualization.arrayToDataTable([
                                ['Year', 'statistic value'],
                                ['2012', cr.year2012],
                                ['2013', cr.year2013],
                                ['2014', cr.year2014],
                                ['2015', cr.year2015],
                                ['2016', cr.year2016]
                            ]);

                            var options = {
                                chart: {
                                    title: stat,
                                    subtitle: 'from years : 2012-2016',
                                },
                                bars: 'vertical',
                                vAxis: {format: 'decimal'},
                                height: 400,
                                colors: ['#9e0c01'],
                                backgroundColor: '#ffffff',
                            };
                            var chart = new google.charts.Bar(document.getElementById('chart_display'));
                            chart.draw(data, google.charts.Bar.convertOptions(options));


                        }

                        return false;
                    }
                }
            });
            gapi.client.setApiKey('AIzaSyC6XnYz7neCA3a4UPV2cx-zapUKxCBOGyw');
            gapi.client.load('youtube', 'v3', function(){
                makeRequest();
            });
        }

    }


}
function makeRequest() {
    var q = province+" crime news videos";
    var request = gapi.client.youtube.search.list({
        q: q,
        part: 'snippet',
        maxResults: 1
    });
    var vidId;
    request.execute(function(response)  {
        $('#displayvideo').empty()
        var srchItems = response.result.items;
        $.each(srchItems, function(index, item) {
            vidId = item.id.videoId;
            vidTitle = item.snippet.title;
            vidThumburl = item.snippet.thumbnails.default.url;
            var videodescription = item.snippet.description;
            $('#displayvideo').append('<pre>'+'<b>'+"LATEST NEWS VIDEO :" +'<font color="red">'+ vidTitle + "</br>" + videodescription +'</font>'+'</b>'+ '</pre>');
        })
        display(vidId);
    })
}
function display(vid)
{
    $("#playvideohere").show();
    var s = "https://www.youtube.com/embed/" + vid;
    document.getElementById("playvideohere").src=s;
}
function disableselect()
{
    var chrt= document.radiobuttons.chart_type.value;
    if(chrt === "area_chart") {
        document.getElementById("provinces").disabled = true;
        document.getElementById("year").disabled = true;
    }
    else
    {
        document.getElementById("provinces").disabled = false;
        document.getElementById("year").disabled = false;
    }
}
