let map;
let infoWindow;
//TODO: Adjust. Italy: lat: 42.733, lng: 13.304 
const defaultLat = 41.500;
const defaultLng = 13.304;

let usersOnline = [];
let markersOnMap = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: defaultLat, lng: defaultLng}, 
          zoom: 5 //TODO: Adjust
          /*
          1: World
          5: Landmass/continent
          10: City
          15: Streets
          20: Buildings
          */
        });
  //TODO: Do something with this
  infoWindow = new google.maps.InfoWindow({map: map});
        let infoContent = "Test";
        infoWindow.setContent(infoContent);
        /* Disabled automatic prompt for geolocation for now
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            let pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent("Location found."); //TODO: Change text here and at errors
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
        */
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    "Error: The Geolocation service failed." :
    "Error: Your browser doesn't support geolocation.");
}


function setNewPosition(pos){
  infoWindow.setPosition(pos);
  //infoWindow.setContent("You."); Doesn't work if infoWindow is not set again in this func
  map.setCenter(pos);
}


/*This function calculates great-circle distances between the two points 
– that is, the shortest distance over the earth’s surface – using the ‘Haversine’ formula.*/
function deg2rad(deg) {
  return deg * (Math.PI/180)
}
//TODO: Show distance in km of users (Maybe at start of chat)
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(lat2-lat1);  // deg2rad above
  let dLon = deg2rad(lon2-lon1); 
  let a = 
  Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
  Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  let d = R * c; // Distance in km (In linea d'aria)
  return d;
}
/*Haversine formula end*/

//TODO: Just a test function, delete when done
function moveMap(){
  let currentLat = map.getCenter().lat();
  let currentLng = map.getCenter().lng()
  currentLat += 1;
  currentLng += 1;

setNewPosition(
  {
    lat: currentLat ,
    lng: currentLng
  });
}


function emitUpdateCoords (newLat, newLng){
  let socket = io();
    if (sessionID) {
      socket.emit("updateOnlineContactCoords", {
        uniqueID: user._id,
        lat: newLat,
        lng: newLng
      });
    }else{
      //TODO: Handle error better
      console.log("Error: Could not retrive ID");
    };
}

//Sets also user's location to 0, 0 and removes the marker from map
function eraseLocation(){
  $.ajax({
    type: "PUT",
    url: "/updateUserCoordinates",
    data: {
      userID: user._id,
      lat: 0, 
      lng: 0
    },
    success: function() {
      console.log("Location Erased");
      emitUpdateCoords(0, 0);
      user.lat = 0;
      user.lng = 0;
    },
    error: function(err){
      console.log("Error: " , err);
    },
    complete: function(){
      removeLocalUserMarker();
      //TODO: Show success message
    }
  });
}

//Get current location of the user, and broadcast them to the server. 
//TODO: At first login, show tutorial or link to FAQ (Click this to broadcast your location, or something like that)
function broadcastLocation(){
  //TODO: Delete Prints
  console.log("Lat, Lng:");
  console.log(user.lat);
  console.log(user.lng);
  if (user.google) {
    console.log(user.google.name);
  } else if (user.facebook) {
    console.log(user.facebook.name);
  };
  //TODO: Adjust
  // Try HTML5 geolocation. 
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      let pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      //TODO: Figure out why the message shows only the first time the function is called
      infoWindow.setContent("Location found."); //TODO: Change text here and at errors
      map.setCenter(pos);

      //TODO: Here Set user.lat and .lng to current lat and lng:
      // console.log(user.lat);
      // console.log(user.lng);
      // console.log(pos.lat);
      // console.log(pos.lng);
  
      $.ajax({
        type: "PUT",
        url: "/updateUserCoordinates",
        data: {
          userID: user._id,
          lat: pos.lat, 
          lng: pos.lng
        },
        success: function() {
          console.log("Coordinates Updated.");
          emitUpdateCoords(pos.lat, pos.lng);
          user.lat = pos.lat;
          user.lng = pos.lng;
        },
        error: function(err){
          console.log("Error: " , err);
        },
        complete: function(){
          updateMarkersOnMap ();
        }
      });

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
}

//TODO1: optimization: remove the style element when the marker is removed to free memory. See TODO2
  //If I decide to remove it, give it an "id" on creation, so I can remove it by "id".
  function styleMarker (markerPicture) {
    //Select any element with picSrc and style it
    let picSrc = markerPicture;
    let style = document.createElement("style");
    style.type = "text/css";
    //Using backtick with picSrc in expression. TODO: Compile with babel
    //Selecting "*" with picSrc in case google decides to not use divs anymore.
    style.innerHTML = `
    * [src="${picSrc}"] {
      border-radius:30px; 
      border:1px solid #000 !important; 
    }`;
    document.getElementsByTagName("head")[0].appendChild(style);
  }

  //TODO2: See TODO1
  function removeMarker (markerToRemove) {
    //Remove the marker from the map: 
    markerToRemove.setMap(null);
    //Delete marker:
    markerToRemove = null;
  }

  //Pass online contact as argument to add marker on map
  function addMarker (newMarker) {
    styleMarker(newMarker.picture);
    let thisMarker = new google.maps.Marker({
      position: newMarker.latLng,
      map: map,
      title: newMarker.name,
      icon: newMarker.picture,
      //Makes it a discreet DOM element accessible by css:
      optimized:false
    });
    //Open chatWindow on click, only if the marker is not yourself
    if (newMarker.id != sessionID) {
      thisMarker.addListener("click", function() {
        //TODO: Add these?
        //map.setZoom(8);
        //map.setCenter(thisMarker.getPosition());
        openChatWindow(newMarker.name, newMarker.id, true);
      });
    }else{
      //Used to remove marker when erasing location
      thisMarker.id = "localUserMarker";
    };
    //uniqueID needed to check if the marker is on the map
    thisMarker.uniqueID = newMarker.uniqueID;
    markersOnMap.push(thisMarker);
  }

  //Return Boolean if uniqueID is in inputArray
  function isUniqueIDInArray (inputArray, uniqueID) {
    for (let i = inputArray.length - 1; i >= 0; i--) {
      if (inputArray[i].uniqueID === uniqueID) {
        return true;
      }
    }
    return false;
  }

  //Add markers if they are not already on the map
  //Removes them if they are offline
  function updateMarkersOnMap () {
    //Add markers
    for (let i = usersOnline.length - 1; i >= 0; i--) {
      let newMarker = usersOnline[i];

      //If there are no coordinates, skip it
      if (! newMarker.lat && ! newMarker.lng) {continue;};
      //If the marker was already added to the map skip it
      if ( isUniqueIDInArray( markersOnMap, newMarker.uniqueID ) ) {continue;};
      newMarker.latLng = new google.maps.LatLng({
        lat: newMarker.lat, 
        lng: newMarker.lng
      });
      //console.log("Adding");
      addMarker(newMarker)
    };

    //Remove markers
    for (let i = markersOnMap.length - 1; i >= 0; i--) {
      let markerToRemove = markersOnMap[i];
      //If the marker is not online anymore
      if ( ! isUniqueIDInArray( usersOnline, markerToRemove.uniqueID ) ) {
        //console.log("Removing");
        removeMarker (markerToRemove);
        //Remove the marker from the array
        markersOnMap.splice(i, 1);
      };
    };
  };

  /*Remove the local user marker from map, and set coords on usersOnline array to 0.
    Necessary so that updateMarkersOnMap doesn't add it again on the map
    immediately after it's removed.*/
  function removeLocalUserMarker() {
    for (let i = usersOnline.length - 1; i >= 0; i--) {
      if (usersOnline[i].uniqueID === user._id) {
        usersOnline[i].lat = 0;
        usersOnline[i].lng = 0;
        //console.log("00ing in usersonline");
      };
    };

    for (let i = markersOnMap.length - 1; i >= 0; i--) {
      let markerToRemove = markersOnMap[i];
      if ( markerToRemove.id === "localUserMarker" ) {
        //console.log("Removing");
        removeMarker (markerToRemove);
        //Remove the marker from the array
        markersOnMap.splice(i, 1);
        return;
      };
    };
  }

$(document).ready(function(){
  let mapUpdateLoop =  setInterval(updateMarkersOnMap, 1000); //TODO: Set to 5000 or 10000
})