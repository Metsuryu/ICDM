let map;
let infoWindow;
//TODO: Adjust. Italy: lat: 42.733, lng: 13.304 
const defaultLat = 42.733;
const defaultLng = 13.304;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: defaultLat, lng: defaultLng}, 
          zoom: 7 //TODO: Adjust
          /*
          1: World
          5: Landmass/continent
          10: City
          15: Streets
          20: Buildings
          */
        });
  infoWindow = new google.maps.InfoWindow({map: map});
        /*
        TODO: Show image and name for every person online on map. 
        This doesn't work: is not fixed on map:
        let infoContent = "<div><img src=\"" + user.facebook.picture + "\"></div>"; 
        */
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

//TODO: Finish
function eraseLocation(){
  //Move to Null Island
  //Set also user's position to 0,0
  setNewPosition(
  {
    lat: 0,
    lng: 0
  });
  
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
    },
    error: function(err){
      console.log("Error: " , err);
    },
    complete: function(){
    }
  });
}

//TODO: Get current location of the user, and broadcast them to the server. 
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
        },
        error: function(err){
          console.log("Error: " , err);
        },
        complete: function(){
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