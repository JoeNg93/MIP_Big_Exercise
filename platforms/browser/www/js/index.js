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
        allLocationData: [],
        currentLocationData: {},
        outputMsg: '',
        yourLocationMsg: '',
        address: '',
        map: null,
        geocoder: null,
        openMarkersModal: false,
        fromMarker: "default",
        toMarker: "default"
      },
      mounted: function() {
        this.map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: 65.0120888, lng: 25.46507719996 },
          zoom: 13
        });
        this.geocoder = new google.maps.Geocoder();
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
        handleClickGetDistance: function () {
          console.log(this.fromMarker);
          console.log(this.toMarker);
        },
        handleClickOpenMarkersModal: function () {
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
        _addMarkerToMap: function(locationObj) {
          this._clearMarker(locationObj);
          var marker = new google.maps.Marker({
            position: locationObj,
            animation: google.maps.Animation.DROP,
            map: this.map
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
            map: this.map
          });
          return marker;
        }
      }
    });
  }
};

app.initialize();
