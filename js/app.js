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
    
    function fetchLocationInfo() {
        var url = "https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:" +
            zip.value + "&key=AIzaSyCqN2adCmsc3ov72hoOy6GKseL1p1_JmJs";

        var request = new XMLHttpRequest();
        request.onload = parseResponse;
        request.open("GET", url, true);
        request.send();
    }

    function parseResponse() {
        if (this.status == 200) {
            var data = JSON.parse(this.responseText);
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;

            var latLong = new google.maps.LatLng(lat,lng);
            var marker = new google.maps.Marker({
                position: latLong,
                map: map,
                title: "Your entered zip!"
            }); 

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
}

google.maps.event.addDomListener(window, 'load', initialize);