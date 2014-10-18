"use strict";



function initialize() {
    //initialize map on UW
    var mapOptions = {
        center: { lat: 47.6550, lng: -122.3080},
        zoom: 15
    };

    //load objects
    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    var find = document.getElementById('find');

    //add events
    
    find.addEventListener("click", findEvents);
    var allEventIds = [];
    var eventLoc = [];

    function findEvents() {
        FB.api('/search?q="98105"&type=event', function(response) {
            for (var i = 0; i < response.data.length; ++i) {
                allEventIds.push(response.data[i].id);
            }
            for (var i = 0; i < allEventIds.length; ++i) {
                FB.api("/" + allEventIds[i], function(response) {
                    parseFacebookData(response);
                });   
            }
        });
    }

    //makes a new google maps object using the latitudes and longitudes
    function makeGoogleMapObject(latitude, longitude){
        var latLong = new google.maps.LatLng(latitude, longitude);
        var marker = new google.maps.Marker({
            position: latLong,
            map: map
        });
    }

    //function that parses the given facebook event info and tries to get out the description of it and the location
    function parseFacebookData(response) {
        var name = response.name;
        var desc = response.description;
        var location = response.location;
        var startTime = response.start_time;
        var endTime = response.end_time;

        if (checkTime(startTime, endTime)) {
            processData(startTime, desc, location);
        }
    }

    //helper method for processing Facebook event data if the key word of "free" was found in it
    function processData(sDate, description, location) {
        if (description) {
            var free = "free";
            var lines = description.split("\n");
            console.log(lines);
            for (var i = 0; i < lines.length; i++) {    
                var wordsInTitle = lines[i].split(" ");
                if (wordsInTitle) {
                    for (var j = 0; j < wordsInTitle.length; j++) {
                        if (wordsInTitle[j].toLowerCase() === free) { // i did this because most events do not have free written in their name
                            geocodeLocation(sDate, description, location);
                        }
                    }
                }
            }       
        }
    } 

    function geocodeLocation(sDate, description, location) {
        console.log(location);  
        var geoCoder = new google.maps.Geocoder();
        var address = location;
        geoCoder.geocode({'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                //map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
                var eventDate = sDate.split("T")[0];
                var contentString = '<p>Start Date: ' + eventDate + '</p>' +
                    '<p>Description: ' + description + '</p>';
                attachInfoWindow(marker, contentString);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    //attach info window to given marker
    function attachInfoWindow(marker, contentString) {
        var infoWindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 300   
        });

        google.maps.event.addListener(marker, "click", function () {
            infoWindow.open(map, marker);
        });
    }

    //javascript function for getting the current date and time and comparing it to the venue to see if it matches 
    function checkDate(start, end){
        if (end) {
        var splitDate = end.split("-");
        for (var i = 0; i < splitDate.length; i+=3) {
            var year = parseInt(splitDate[i]);
            var month = parseInt(splitDate[i+1]);
            var day = parseInt(splitDate[i+2]);
        }
        var currentdate = new Date();
        if(year < currentdate.getFullYear()){ 
            return false; 
        }else if (year == currentdate.getFullYear()) {
            if(month < currentdate.getMonth()){
                return false;
            }else if(month == currentdate.getMonth()) {
                return (day - currentdate.getDate() >= 0) && checkTime(start, end);
            }else{
                return true;
            }
        }else{
            return true;
        }
    } else { 
        return true; }
    }

    //check if the event time is still valid
    function checkTime(start, end){
        if (end) {
        var splitTime1 = end.split("T");
        var midSplit = splitTime1[1].split("-");
        var splitTime2 = midSplit[0].split(":");
        var hour = splitTime2[0];
        var min = splitTime2[1];
        var sec = splitTime2[2];
        var currentdate = new Date();
        if(hour < currentdate.getHours()){ 
            return false; 
        }else if (hour == currentdate.getHours()) {
            if(min < currentdate.getMinutes()){
                return false;
            }else if(min == currentdate.getMinutes()){
                return (sec - currentdate.getSeconds() >= 0);
            }else{
                return true;
            }
        }else{
            return true;
        }
    }
    }


}


google.maps.event.addDomListener(window, 'load', initialize);


/*//parses the entered response in the search box
    function parseResponse() {
        if (this.status == 200) {
            var data = JSON.parse(this.responseText);
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            makeGoogleMapObject(lat, lng);
            } 

            var closeEvents = [];

            // computes distance from given zipcode to location - if within 3200 meters, shows them
            for (var i = 0; i < exampleEvents.length; ++i) {
                var existingLatLong = new google.maps.LatLng(exampleEvents[i][1],
                exampleEvents[i][2]);
                var dist = google.maps.geometry.spherical.computeDistanceBetween(existingLatLong, latLong);
                if (Math.abs(dist) < 3200) {
                    closeEvents.push(exampleEvents[i]);
                }
            }
                  
            addExistingEvents(closeEvents);
    }*/