
$(document).ready(function () {
    $("#emre_content_display").hide();
    $("#emre_img_placeholder").show();
      readYears();
    });

function read(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            return xhttp.responseXML;
        }
    };
    xhttp.open("GET", xmlFile,false);
    xhttp.send();
    return xhttp.responseXML;
    }


function readToLogo(){
    var xml = read();
    x = xml.getElementsByTagName('Name');

    document.getElementById("logo-head").innerHTML = x[0].childNodes[0].nodeValue;
    }

function getSelectValues(select) {
    var result = [];
    var options = select && select.options;
    var opt;

    for (var i=0, iLen=options.length; i<iLen; i++) {
        opt = options[i];

        if (opt.selected) {
            result.push(opt.value || opt.text);
            console.log(opt.text);
        }
    }
    return result;
}

function getSelectTexts(select) {
    var result = [];
    var options = select && select.options;
    var opt;

    for (var i=0, iLen=options.length; i<iLen; i++) {
        opt = options[i];

        if (opt.selected) {
            result.push(opt.text);
        }
    }
    return result;
}

function getSelectedText(elementId) {
    var elt = document.getElementById(elementId);

    if (elt.selectedIndex == -1)
        return null;

    return elt.options[elt.selectedIndex].text;
    }

function readYears(){
    var xml = read();
    cansim = xml.getElementsByTagName('cansim-Series');
    var j = 0;
    for(var i=0; i<cansim.length; i++){
        if(cansim[i].getAttribute("GEO")== 1 && cansim[i].getAttribute("OFF")==1){
            j=i;
            break;
        }
    }
    var elmt = document.getElementById("year");
    for(var i=0; i<cansim[j].childNodes.length; i++){
        var detail = cansim[j].childNodes[i];
        if (detail.nodeType === 1 && detail.getAttribute("TIME_PERIOD")>-1){
            opt = document.createElement("option");
            opt.value = detail.getAttribute("TIME_PERIOD");
            opt.textContent = detail.getAttribute("TIME_PERIOD");
            elmt.appendChild(opt);
        }
    }
}

function generate(){

    $("#emre_img_placeholder").hide();
    $("#emre_content_display").show();

    if(!formValidation()){
        return;
    }
    var xml = read();
    cansim = xml.getElementsByTagName('cansim-Series');
    geo = document.getElementById("provinces").value;
    geo_text = getSelectedText("provinces");
    off = document.getElementById("crime").value;
    off_text = getSelectTexts(document.getElementById("crime"));
    y = getSelectValues(document.getElementById("year"));
    crime_vals = getSelectValues(document.getElementById("crime"));
    var crime_result = [];
    for(var i=0; i<cansim.length; i++){
        if(cansim[i].getAttribute("GEO")== geo && crime_vals.indexOf(cansim[i].getAttribute("OFF"))>-1){
            crime_result.push(i);
        }
    }
    var yText = "";
    for(var i=0; i<y.length; i++){
        yText+="<th>"+y[i]+"</th>"
    }
    var cText = "";
    for(var j=0; j<crime_result.length; j++){
        cText += "<tr><td>"+off_text[j]+"</td>";
        for(var i=0; i<cansim[crime_result[j]].childNodes.length; i++){
            var detail = cansim[crime_result[j]].childNodes[i];
            if (detail.nodeType === 1 && y.indexOf(detail.getAttribute("TIME_PERIOD"))>-1){
                cText +="<td>"+detail.getAttribute("OBS_VALUE")+"</td>";
            }
        }
        cText+="</tr>";
    }
    one_table = document.getElementById("one_table");
    var table_data = "<table>";
    table_data += "<figcaption>Crime Rate in <b>"+geo_text+"</b> from <b>"+y[0]+"</b> to <b>"+y[y.length-1]+"</b></figcaption>";
    table_data +="<thead><tr><th>Type Of Offence</th>";
    table_data +=yText;
    table_data +="</thead><tbody>";
    table_data +=cText;
    table_data +="</tbody></table>";
    one_table.innerHTML = table_data;
    var options = {
        title:'Crime Rate in '+geo_text+' from '+y[0]+' to '+y[y.length-1]
    };
    var chart_data=[];
    var years = [];
    years[0] = "Crimes";
    for(var i=0; i<y.length; i++){
        years[i+1] = y[i];
    }
    chart_data[0]=years;
    var temp=[];
    var z=0;
    for(var j=0; j<crime_result.length; j++){
        temp=[];
        temp[0]=off_text[j];
        var k=0;
        for(var i=0; i<cansim[crime_result[j]].childNodes.length; i++){
            var detail = cansim[crime_result[j]].childNodes[i];
            if (detail.nodeType === 1 && y.indexOf(detail.getAttribute("TIME_PERIOD"))>-1){
                k=k+1;
                temp[k] =parseInt(detail.getAttribute("OBS_VALUE"));
            }
        }
        z=z+1;
        chart_data[z]=temp;
    }

    var data = google.visualization.arrayToDataTable(chart_data);
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data, options);

}

function refresh()
{
    document.getElementById("myform").reset();
    one_table.innerHTML ='';
}

function formValidation() {
    var province = document.getElementById('provinces');
    var year = document.getElementById('year');
    var crime = document.getElementById('crime');
    if (!validateprovince(province)) {
        return false;
    }
    if (!crimeSelect(crime)) {
        return false;
    }

    if(!validateForm(province, year, crime)){
        return false;
    }
    return true;

}

function validateprovince(province) {
    if (province.value == 0) {
        document.getElementById("growl").innerHTML = "Please select a province from the list...";
        return true;
        province.focus();
        return false;
    }
    else {
        return true;
    }
}

function crimeSelect(crime) {
    console.log(crime.value);
    if (crime.value == "") {
        document.getElementById("growl").innerHTML = "Please select a crime from the list...";
        crime.focus();
        return false;
    }
    else {
        return true;
    }
}


function validateForm(province, year, crime) {
    console.log(crime.selectedIndex);
    if (province.selectedIndex>-1 && year.selectedIndex>-1 && crime.selectedIndex>-1) {
        document.getElementById("growl").innerHTML = "Congratulations. Your data is displayed on the left!";
        return true;
    } else {
        //alert("All the fields must be filled!");
        document.getElementById("growl").innerHTML = "All the fields including the year must be selected!";
        return false;
    }

}















