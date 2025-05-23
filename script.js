let watchId = null;

function startTracking() {
  if ('geolocation' in navigator) {
    watchId = navigator.geolocation.watchPosition(pos => {
      const { latitude, longitude } = pos.coords;
      document.getElementById("output").innerText = `Lat: ${latitude.toFixed(5)} - Lng: ${longitude.toFixed(5)}`;
    }, err => {
      document.getElementById("output").innerText = `Error: ${err.message}`;
    }, {
      enableHighAccuracy: true
    });
  } else {
    alert("Geolocatie wordt niet ondersteund.");
  }
}

function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    document.getElementById("output").innerText = "Tracking gestopt";
  }
}
