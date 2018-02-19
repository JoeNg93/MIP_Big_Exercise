var app = {
  // Application Constructor
  initialize: function() {
    document.addEventListener(
      'deviceready',
      this.onDeviceReady.bind(this),
      false
    );
  },

  onDeviceReady: function() {
    var app = new Vue({
      el: '#app',
      data: {
        currentPage: 'mainPage',
        allLocationData: [],
        currentLocationData: {},
        outputMsg: '',
        yourLocationMsg: '',
        distanceMsg: '',
        directionMsg: '',
        address: '',
        map: null,
        geocoder: null,
        openMarkersModal: false,
        fromMarker: 'default',
        toMarker: 'default',
        infoWindow: null,
        markerInfoToBeAdded: '',
        currentClickMarker: null,
        currentClickMarkerInfo: [],

        // navigationPage
        estimatedDistance: '',
        estimatedTime: '',
        directions: [],
        navigationMap: null,
        directionsRenderer: null
      },
      mounted: function() {
        var self = this;
        // Initialize maps
        self.map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: 65.0120888, lng: 25.46507719996 },
          zoom: 13
        });
        self.navigationMap = new google.maps.Map(
          document.getElementById('navigationMap'),
          {
            center: { lat: 65.0120888, lng: 25.46507719996 },
            zoom: 13
          }
        );

        // Initialize Firebase
        var config = {
          apiKey: 'AIzaSyDlD0WJ3uDrGK0tBWaIqVf3-I_DwCDiECo',
          authDomain: 'mip-big-exercise-78ada.firebaseapp.com',
          databaseURL: 'https://mip-big-exercise-78ada.firebaseio.com',
          projectId: 'mip-big-exercise-78ada',
          storageBucket: 'mip-big-exercise-78ada.appspot.com',
          messagingSenderId: '60397382997'
        };
        firebase.initializeApp(config);
        firebase
          .auth()
          .signInWithEmailAndPassword('t6ngtu00@students.oamk.fi', 't6ngtu00')
          .then(function() {
            self._initializeSavedMarkers();
          });

        // Initialize info window
        self.infoWindow = new google.maps.InfoWindow({
          content: document.getElementById('info-window')
        });

        self.geocoder = new google.maps.Geocoder();
      },
      methods: {
        handleClickGetLatLng: function() {
          var self = this;
          self
            ._getLatLng(self.address)
            .then(function(result) {
              self.address = result.address;
              var locationObj = {
                lat: result.coords.lat,
                lng: result.coords.lng
              };
              self.outputMsg =
                'Latitude: ' +
                locationObj.lat +
                ', Longitude: ' +
                locationObj.lng;
              var marker = self._addMarkerToMap(locationObj);
              self.allLocationData.push({
                marker: marker,
                address: self.address
              });
              self.map.setCenter(locationObj);
            })
            .catch(function(reason) {
              self.outputMsg = reason;
            });
        },
        handleClickGetCurrentLocation: function() {
          var self = this;
          self.yourLocationMsg =
            'Getting your current location. Please wait...';
          self
            ._getCurrentPosition()
            .then(function(position) {
              var lat = position.coords.latitude;
              var lng = position.coords.longitude;
              var locationObj = {
                lat: lat,
                lng: lng
              };
              var marker = self._addCurrentPositionMarkerToMap(locationObj);
              self.currentLocationData.marker = marker;
              self.map.setCenter(locationObj);
              self.yourLocationMsg =
                'Your location: ' + lat + ' (lat), ' + lng + ' (lng)';
              return self._getAddress(locationObj);
            })
            .then(function(result) {
              self.currentLocationData.address = result.address;
            })
            .catch(function(reason) {
              self.yourLocationMsg = 'Error: ' + reason.message;
            });
        },
        handleClickGetDistance: function() {
          var from = new google.maps.LatLng(
            this.fromMarker.position.lat(),
            this.fromMarker.position.lng()
          );
          var to = new google.maps.LatLng(
            this.toMarker.position.lat(),
            this.toMarker.position.lng()
          );
          var distance = google.maps.geometry.spherical.computeDistanceBetween(
            from,
            to
          );
          this.distanceMsg = (distance / 1000).toFixed(2) + ' km';
        },
        handleClickOpenMarkersModal: function() {
          var markerCount = 0;
          if (this.currentLocationData.marker) {
            markerCount += 1;
          }
          markerCount += this.allLocationData.length;
          if (markerCount < 2) {
            alert('Please add at least 2 markers');
            return;
          }
          this.openMarkersModal = true;
        },
        handleClickGetDirection: function() {
          var self = this;
          var from = new google.maps.LatLng(
            self.fromMarker.position.lat(),
            self.fromMarker.position.lng()
          );
          var to = new google.maps.LatLng(
            self.toMarker.position.lat(),
            self.toMarker.position.lng()
          );
          var directionsService = new google.maps.DirectionsService();
          directionsService.route(
            {
              origin: from,
              destination: to,
              travelMode: google.maps.DirectionsTravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.METRIC
            },
            function(response, status) {
              console.log(response);
              if (status === google.maps.DirectionsStatus.OK) {
                self.estimatedDistance =
                  response.routes[0].legs[0].distance.text;
                self.estimatedTime = response.routes[0].legs[0].duration.text;
                self.directions = response.routes[0].legs[0].steps.map(function(
                  step
                ) {
                  return {
                    distance: step.distance.text,
                    duration: step.duration.text,
                    instructions: step.instructions
                  };
                });
                console.log(self.directions);
                self.currentPage = 'navigationPage';

                self.directionsRenderer = new google.maps.DirectionsRenderer({
                  map: self.navigationMap,
                  directions: response
                });
                self.openMarkersModal = false;
              } else {
                self.directionMsg = 'Unable to get the direction!';
              }
            }
          );
        },
        handleClickStopNavigation: function() {
          this.directionsRenderer.setMap(null);
          this.directionsRenderer = null;
          this.currentPage = 'mainPage';
        },
        handleClickAddMarkerInfo: function() {
          var self = this;
          var lat = self.currentClickMarker.position.lat();
          var lng = self.currentClickMarker.position.lng();
          firebase
            .database()
            .ref('/location_info')
            .once('value', function(snapshot) {
              var locationInfo = snapshot.val();
              if (!locationInfo) {
                firebase
                    .database()
                    .ref('/location_info')
                    .push({
                      info: [self.markerInfoToBeAdded],
                      lat: lat,
                      lng: lng
                    })
                    .then(function() {
                      alert('New info added!');
                      self.markerInfoToBeAdded = '';
                      self.infoWindow.close();
                    })
                    .catch(function() {
                      alert('Cannot add new info. Please try again later!');
                      self.infoWindow.close();
                    });
                return;
              }

              var locationInfoWithID = Object.keys(locationInfo).map(function (key) {
                return Object.assign({}, {id: key}, locationInfo[key]);
              });

              var location = locationInfoWithID.find(function(
                eachLocation
              ) {
                return eachLocation.lat === lat && eachLocation.lng === lng;
              });
              if (!location) {
                firebase
                  .database()
                  .ref('/location_info')
                  .push({
                    info: [self.markerInfoToBeAdded],
                    lat: lat,
                    lng: lng
                  })
                  .then(function() {
                    alert('New info added!');
                    self.markerInfoToBeAdded = '';
                    self.infoWindow.close();
                  })
                  .catch(function() {
                    alert('Cannot add new info. Please try again later!');
                    self.infoWindow.close();
                  });
              } else {
                firebase
                  .database()
                  .ref('/location_info/' + location.id)
                  .set({
                    info: location.info.concat(self.markerInfoToBeAdded),
                    lat: location.lat,
                    lng: location.lng
                  })
                  .then(function() {
                    alert('New info added!');
                    self.markerInfoToBeAdded = '';
                    self.infoWindow.close();
                  })
                  .catch(function() {
                    alert('Cannot add new info. Please try again later!');
                    self.infoWindow.close();
                  });
              }
            });
        },
        _initializeSavedMarkers: function() {
          var self = this;
          firebase
            .database()
            .ref('/location_info')
            .on('value', function(snapshot) {
              var locationInfo = snapshot.val();
              if (!locationInfo) {
                return;
              }

              Object.values(locationInfo).forEach(function(location) {
                var locationObj = { lat: location.lat, lng: location.lng };
                var marker = self._addMarkerToMap(locationObj, location.info);
                self._getAddress(locationObj).then(function(data) {
                  self.allLocationData.push({
                    marker: marker,
                    address: data.address
                  });
                });
              });
            });
        },
        _getLatLng: function(address) {
          var self = this;
          return new Promise(function(resolve, reject) {
            self.geocoder.geocode({ address: address }, function(
              results,
              status
            ) {
              if (status !== 'OK') {
                reject('Error! Request to get lat lng cannot be fulfilled');
              }
              var address = results[0].formatted_address;
              var location = results[0].geometry.location;
              var locationObj = {
                lat: location.lat(),
                lng: location.lng()
              };
              resolve({ coords: locationObj, address: address });
            });
          });
        },
        _getAddress: function(locationObj) {
          var self = this;
          return new Promise(function(resolve, reject) {
            self.geocoder.geocode({ location: locationObj }, function(
              results,
              status
            ) {
              if (status !== 'OK') {
                reject('Error! Request to get lat lng cannot be fulfilled');
              }
              var address = results[0].formatted_address;
              var location = results[0].geometry.location;
              var locationObj = {
                lat: location.lat(),
                lng: location.lng()
              };
              resolve({ coords: locationObj, address: address });
            });
          });
        },
        _getCurrentPosition: function() {
          return new Promise(function(resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
        },
        _addMarkerToMap: function(locationObj, locationInfo) {
          var self = this;
          self._clearMarker(locationObj);
          var marker = new google.maps.Marker({
            position: locationObj,
            animation: google.maps.Animation.DROP,
            map: this.map
          });
          marker.addListener('click', function() {
            self.currentClickMarkerInfo = [];
            if (locationInfo) {
              self.currentClickMarkerInfo = locationInfo;
            }
            self.currentClickMarker = marker;
            self.infoWindow.open(self.map, marker);
          });
          return marker;
        },
        _clearMarker: function(locationObj) {
          var locationData = this.allLocationData.find(function(data) {
            return (
              data.marker.position.lat() === locationObj.lat &&
              data.marker.position.lng() === locationObj.lng
            );
          });

          if (locationData) {
            locationData.marker.setMap(null);
            this.allLocationData = this.allLocationData.filter(function(data) {
              return (
                data.marker.position.lat() !==
                  locationData.marker.position.lat() &&
                data.marker.position.lng() !==
                  locationData.marker.position.lng()
              );
            });
          }
        },
        _addCurrentPositionMarkerToMap: function(locationObj) {
          if (this.currentLocationData.marker) {
            this.currentLocationData.marker.setMap(null);
            this.currentLocationData.marker = null;
          }
          var marker = new google.maps.Marker({
            position: locationObj,
            animation: google.maps.Animation.DROP,
            icon: 'img/icons8-location-50.png',
            map: this.map
          });
          return marker;
        }
      }
    });
  }
};

app.initialize();
