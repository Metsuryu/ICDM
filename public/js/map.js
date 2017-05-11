"use strict";

var map = void 0;
//Italy: lat: 41.500, lng: 13.304 
var defaultLat = 41.500;
var defaultLng = 13.304;
var usersOnline = [];
var markersOnMap = [];
//If localUserOnMap === true, update map position when doing broadcast
var localUserOnMap = false;
var mapUpdateTimer = 2000; //2 Seconds, that is changed to 10 seconds after 30 seconds.
const tenSeconds = 10000;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: defaultLat, lng: defaultLng },
    zoom: 5
    /*
    1: World
    5: Landmass/continent
    10: City
    15: Streets
    20: Buildings
    */
  });
}

function showMessageOnMap(message, pos) {
  if (!pos) {
    pos = map.getCenter();
  };
  var infoWindow = new google.maps.InfoWindow({ map: map });
  infoWindow.setPosition(pos);
  infoWindow.setContent(message);
}

function handleLocationError(browserHasGeolocation, pos) {
  var geoFail = "Error: The Geolocation service failed.";
  var geoNotSup = "Error: Your browser doesn't support geolocation.";
  if (localLanguage === "Ita") {
    geoFail = "Errore: Il servizio di geolocazione non ha funzionato.";
    geoNotSup = "Errore: Il tuo browser non supporta la geolocazione.";
  }

  showMessageOnMap(browserHasGeolocation ? geoFail : geoNotSup, pos);
}

function emitUpdateCoords(newLat, newLng) {
  var socket = io();
  if (sessionID) {
    socket.emit("updateOnlineContactCoords", {
      uniqueID: user._id,
      lat: newLat,
      lng: newLng
    });
  } else {
    //console.log("Error: Could not retrive ID");
    var errorMsg = "Error: Could not retrive ID from server. Try refreshing the page.";
    if (localLanguage === "Ita") {
      errorMsg = "Errore: Impossibile ricevere ID dal server. Provare a ricaricare la pagina.";
    }
    showMessageOnMap(errorMsg);
  };
}

//Sets also user's location to 0, 0 and removes the marker from map
function eraseLocation() {
  $.ajax({
    type: "PUT",
    url: "/updateUserCoordinates",
    data: {
      userID: user._id,
      lat: 0,
      lng: 0
    },
    success: function success() {
      //console.log("Location Erased");
      emitUpdateCoords(0, 0);
      user.lat = 0;
      user.lng = 0;
      removeLocalUserMarker();
    },
    error: function error(err) {
      console.log("Error: ", err);
    },
    complete: function complete() {}
  });
}

//Get current location of the user, and broadcast them to the server. 
function broadcastLocation() {
  //If user's marker is already on map, erase it first, so it can spawn at new location.
  if (localUserOnMap) {
    eraseLocation();
  };
  // Try HTML5 geolocation. 
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);

      $.ajax({
        type: "PUT",
        url: "/updateUserCoordinates",
        data: {
          userID: user._id,
          lat: pos.lat,
          lng: pos.lng
        },
        success: function success() {
          //console.log("Coordinates Updated.");
          emitUpdateCoords(pos.lat, pos.lng);
          user.lat = pos.lat;
          user.lng = pos.lng;
          setTimerToXSecondsAfterDelay(2000, 0);
          setTimerToXSecondsAfterDelay(tenSeconds, tenSeconds);
        },
        error: function error(err) {
          console.log("Error: ", err);
        },
        complete: function complete() {
          updateMarkersOnMap();
        }
      });
    }, function () {
      handleLocationError(true, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, map.getCenter());
  }
}

/*?TODO1: optimization: remove the style element when the marker is removed to free memory. See TODO2
  If I decide to remove it, give it an "id" on creation, so I can remove it by "id".
  Only do if necessary (users reporting slow site) and after profiling.
  */
function styleMarker(markerPicture) {
  //Select any element with picSrc and style it
  var picSrc = markerPicture;
  var style = document.createElement("style");
  style.type = "text/css";
  //Using backtick with picSrc in expression.
  //Selecting "*" with picSrc in case google decides to not use divs anymore.
  style.innerHTML = "* [src='" + picSrc + "'] {border-radius:30px; border:1px solid #000 !important; }";
  document.getElementsByTagName("head")[0].appendChild(style);
}

//TODO2: See TODO1
function removeMarker(markerToRemove) {
  //console.log(markerToRemove);
  //Remove the marker from the map: 
  markerToRemove.setMap(null);
  //Delete marker:
  markerToRemove = null;
}

//Pass online contact as argument to add marker on map
function addMarker(newMarker) {
  var nmPic = newMarker.picture;
  var nmName = newMarker.name;
  var nmID = newMarker.id;
  var nmUID = newMarker.uniqueID;
  var nmLatLng = newMarker.latLng;
  var nmLat = nmLatLng.lat();
  var nmLng = nmLatLng.lng();

  styleMarker(nmPic);
  var thisMarker = new google.maps.Marker({
    position: nmLatLng,
    map: map,
    title: nmName,
    icon: nmPic,
    //Makes it a discreet DOM element accessible by css:
    optimized: false
  });
  //Open chatWindow on click, only if the marker is not yourself
  if (nmUID != user._id) {
    thisMarker.addListener("click", function () {
      openChatWindow(nmName, nmPic, nmID, nmUID, nmLat, nmLng, true);
    });
  } else {
    //Used to remove marker when erasing location
    thisMarker.id = "localUserMarker";
    localUserOnMap = true;
  };
  //uniqueID needed to check if the marker is on the map
  thisMarker.uniqueID = nmUID;
  markersOnMap.push(thisMarker);
}

//Return Boolean if uniqueID is in inputArray
function isUniqueIDInArray(inputArray, uniqueID) {
  for (var i = inputArray.length - 1; i >= 0; i--) {
    if (inputArray[i].uniqueID === uniqueID) {
      return true;
    }
  }
  return false;
}

//Add markers if they are not already on the map
//Removes them if they are offline
function updateMarkersOnMap() {
  //Add markers
  for (var i = usersOnline.length - 1; i >= 0; i--) {
    var newMarker = usersOnline[i];

    //If there are no coordinates, skip it
    if (!newMarker.lat && !newMarker.lng) {
      continue;
    };
    //If the marker was already added to the map, skip it
    if (isUniqueIDInArray(markersOnMap, newMarker.uniqueID)) {
      continue;
    };
    //If it's the localUser's mark, and it's already on the map, skip it.
    if (localUserOnMap && newMarker.id === sessionID) {
      continue;
    };
    //Otherwise, add the marker
    newMarker.latLng = new google.maps.LatLng({
      lat: newMarker.lat,
      lng: newMarker.lng
    });
    addMarker(newMarker);
  };

  //Remove markers
  for (var _i = markersOnMap.length - 1; _i >= 0; _i--) {
    var markerToRemove = markersOnMap[_i];
    //If the marker is not online anymore
    if (!isUniqueIDInArray(usersOnline, markerToRemove.uniqueID)) {
      removeMarker(markerToRemove);
      //Remove the marker from the array
      markersOnMap.splice(_i, 1);
    };
  };
};

/*Remove the local user marker from map, and set coords on usersOnline array to 0.
  Necessary so that updateMarkersOnMap doesn't add it again on the map
  immediately after it's removed.*/
function removeLocalUserMarker() {
  for (var i = usersOnline.length - 1; i >= 0; i--) {
    if (usersOnline[i].uniqueID === user._id) {
      usersOnline[i].lat = 0;
      usersOnline[i].lng = 0;
      //console.log("00ing in usersonline");
    };
  };

  for (var _i2 = markersOnMap.length - 1; _i2 >= 0; _i2--) {
    var markerToRemove = markersOnMap[_i2];
    if (markerToRemove.id === "localUserMarker") {
      //console.log("Removing");
      removeMarker(markerToRemove);
      //Remove the marker from the array
      markersOnMap.splice(_i2, 1);
      localUserOnMap = false;
      return;
    };
  };
}

function setTimerToXSecondsAfterDelay(time, delay) {
  setTimeout(function(){ mapUpdateTimer = time; }, delay);
}

$(document).ready(function () {
  /*When user's coordinates are 0 0, show message explaining how 
  "Broadcast Location" and "Erase Location" work*/
  if (!user.lat && !user.lng) {
    var broadcastMsg = 'Click "Broadcast Location" to show your position on the map to everyone.<br> \
      You can click "Erase Location" to hide your position.';
    if (localLanguage === "Ita") {
      broadcastMsg = 'Clicca su "Trasmetti Posizione" per mostrare a tutti la tua posizione sulla mappa.<br> \
      Puoi cliccare "Nascondi Posizione" per nascondere la tua posizione.';
    }
    showMessageOnMap(broadcastMsg);
  };


  updateMarkersOnMap();
  var mapUpdateLoop = setInterval(updateMarkersOnMap, mapUpdateTimer); //2 Seconds, then 10 seconds
  setTimerToXSecondsAfterDelay(tenSeconds, tenSeconds);
});