"use strict";

function initialize() {
    //initialize map on UW
    var mapOptions = {
        center: { lat: 47.6550, lng: -122.3080},
        zoom: 15
    };

    //example events
    var exampleEvents = [
        ['Suzzallo Library', 47.6557, -122.3084, "Free food! Aww yeah."], 
        ['Odegaard Library', 47.6567, -122.3103, "Free food at midnight!"],
        ['The HUB', 47.6553, -122.3051, "There's always food here!"]
    ];

    //load objects
    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    var add = document.getElementById('add');
    var find = document.getElementById('find');
    var zip = document.getElementById('zip');

    //add events
    add.addEventListener("click", addMarkerListener);
    find.addEventListener("click", fetchLocationInfo);
    
    //fetches the location info from the url address
    function fetchLocationInfo() {
        var url = "https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:" +
            zip.value + "&key=AIzaSyCqN2adCmsc3ov72hoOy6GKseL1p1_JmJs";

        var request = new XMLHttpRequest();
        request.onload = parseResponse;
        request.open("GET", url, true);
        request.send();
    }

    //parses the entered response in the search box
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
        }
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
    function parseFacebookData() {
        if (this.status == 200) {
            var json = JSON.parse(this.responseText);
            var eventElm = json.data;
            for (var i = 0; i < eventElm.length; i++) {
                var name = eventElm[i].name;
                var location = eventElm[i].location;
                var eventID = eventElm[i].id;
                var start_time = json.start_time;
                var end_time = json.end_time;
                if (checkDate(start_time, end_time)) {
                    processData(eventID);
                }
            }
        }
    }

    //helper method for processing Facebook event data if the key word of "free" was found in it
    function processData(eventID){
        var url = "https://graph.facebook.com/" + eventID;
        var json = JSON.parse(this.responseText);
        var description = json.description;
        var free = "free";
        var lines = description.split("\n");
        for (var i = 0; i < lines.length; i++) {    
            var wordsInTitle = lines[i].split(" ");
            if (wordsInTitle[i].toLowerCase() === free) { // i did this because most events do not have free written in their name
                var venue = json.venue;                     //it is usually in their description....
                var latitude = venue.latitude;
                var longitude = venue.longitude;
            }
        }       
    }


    //javascript function for getting the current date and time and comparing it to the venue to see if it matches 
    function checkDate(start, end){
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
    }

    //check if the event time is still valid
    function checkTime(start, end){
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


    //add markers for list of existing events
    function addExistingEvents(eventsArray) {
        for (var i = 0; i < eventsArray.length; ++i) {
            var latLong = new google.maps.LatLng(eventsArray[i][1],
                eventsArray[i][2]);
            var title = eventsArray[i][0];

            var marker = new google.maps.Marker({
                position: latLong,
                map: map,
                title: title
            });
            var contentString = eventsArray[i][3];

            attachInfoWindow(marker, contentString);
        }
    }
    
    //attach info window to given marker
    function attachInfoWindow(marker, contentString) {
        var infoWindow = new google.maps.InfoWindow({
            content: contentString,
            minWidth: 100   
        });

        google.maps.event.addListener(marker, "click", function () {
            infoWindow.open(map, marker);
        });
    }

    //allows add button to add event at location clicked on 
    function addMarkerListener() {
        google.maps.event.addListener(map, "click", function (event) {
            var latitude = event.latLng.lat();
            var longitude = event.latLng.lng();
            var clickLatLong = new google.maps.LatLng(latitude,longitude);

            var marker = new google.maps.Marker({
                position: clickLatLong,
                map: map,
                title: "A new marker!"
            });
        }); //end addListener
    }
}}

google.maps.event.addDomListener(window, 'load', initialize);