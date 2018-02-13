/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var map = null;
var geocoder = null;
var markers = [];
var currentPositionMarker = null;
var app = {
  // Application Constructor
  initialize: function() {
    document.addEventListener(
      'deviceready',
      this.onDeviceReady.bind(this),
      false
    );
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    // var inputEl = $('#address-input');
    // inputEl.on('keypress', onPressEnterInputField);
    //
    // var getLatLngBtn = $('#get-lat-lon-btn');
    // getLatLngBtn.on('click', handleClickGetLatLng);
    //
    // var getCurrentLocationBtn = $('#get-current-location-btn');
    // getCurrentLocationBtn.on('click', handleClickGetCurrentLocation);
    //
    // var closeModalBtn = $('#close-modal-btn');
    // closeModalBtn.on('click', onClickCloseModal);
    //
    // var cancelModelBtn = $('#cancel-modal-btn');
    // cancelModelBtn.on('click', onClickCloseModal);
    //
    // var getMarkerDistanceBtn = $('#get-marker-distance-btn');
    // getMarkerDistanceBtn.on('click', onClickOpenMarkerDistanceModal);

    // var fromMarkerEl = $('#from-marker');
    // fromMarkerEl.on('change', console.log);

    var app = new Vue({
      el: '#app',
      data: {
        markers: [],
        currentPositionMarker: null,
        outputMsg: '',
        address: '',
        map: null,
        geocoder: null
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
          var outputEl = $('#lat-long-content');
          getLatLng(self.geocoder, self.address)
            .then(function(results) {
              self.address = results[0].formatted_address;
              var location = results[0].geometry.location;
              var locationObj = {
                lat: location.lat(),
                lng: location.lng()
              };
              self.outputMsg =
                'Latitude: ' +
                locationObj.lat +
                ', Longitude: ' +
                locationObj.lng;
              addMarkerToMap(locationObj, self.map);
              self.map.setCenter(locationObj);
            })
            .catch(function(reason) {
              self.outputMsg = reason;
            });
        }
      }
    });
  }
};

function onPressEnterInputField(evt) {
  if (evt.keyCode === 13) {
    getLatLong();
  }
}

function onClickCloseModal() {
  var modalEl = $('#marker-distance-modal');
  modalEl.removeClass('is-active');
}

function onClickOpenMarkerDistanceModal() {
  var modalEl = $('#marker-distance-modal');
  modalEl.addClass('is-active');
}

function getLatLng(geocoder, address) {
  return new Promise(function(resolve, reject) {
    geocoder.geocode({ address: address }, function(results, status) {
      if (status !== 'OK') {
        reject('Error! Request to get lat lng cannot be fulfilled');
      }
      resolve(results);
    });
  });
}

function getCurrentPosition() {
  return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

function handleClickGetCurrentLocation() {
  var yourLocationEl = $('#your-location');
  yourLocationEl.html('Getting your current location. Please wait...');
  getCurrentPosition()
    .then(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var locationObj = {
        lat: lat,
        lng: lng
      };
      addCurrentPositionMarkerToMap(locationObj, map);
      map.setCenter(locationObj);
      yourLocationEl.html(
        'Your location: ' + lat + ' (lat), ' + lng + ' (lng)'
      );
    })
    .catch(function(reason) {
      yourLocationEl.html(
        'Cannot get current location. Error: ' + reason.message
      );
    });
}

function handleClickGetLatLng() {
  var outputEl = $('#lat-long-content');
  var inputEl = $('#address-input');
  var address = inputEl.val();
  getLatLng(address)
    .then(function(results) {
      inputEl.val(results[0].formatted_address);
      var location = results[0].geometry.location;
      var locationObj = {
        lat: location.lat(),
        lng: location.lng()
      };
      outputEl.html(
        'Latitude: ' + locationObj.lat + ', Longitude: ' + locationObj.lng
      );
      addMarkerToMap(locationObj, map);
      map.setCenter(locationObj);
    })
    .catch(function(reason) {
      outputEl.html(reason);
    });
}

function addMarkerToMap(position, map) {
  clearMarker(position);
  var marker = new google.maps.Marker({
    position: position,
    animation: google.maps.Animation.DROP,
    map: map
  });
  markers.push(marker);
}

function addCurrentPositionMarkerToMap(position, map) {
  if (currentPositionMarker) {
    currentPositionMarker.setMap(null);
    currentPositionMarker = null;
  }
  currentPositionMarker = new google.maps.Marker({
    position: position,
    animation: google.maps.Animation.DROP,
    map: map
  });
}

function clearMarker(locationObj) {
  var markerToBeCleaned = markers.find(function(marker) {
    return (
      marker.position.lat() === locationObj.lat &&
      marker.position.lng() === locationObj.lng
    );
  });
  if (markerToBeCleaned) {
    markerToBeCleaned.setMap(null);
    markers = markers.filter(function(marker) {
      return (
        marker.position.lat() !== markedToBeCleaned.position.lat() &&
        marker.position.lng() !== markerToBeCleaned.position.lng()
      );
    });
  }
}

function populateSelectMarkers() {
  var fromEl = $('#from-marker');
  var toEl = $('#to-marker');
}

app.initialize();
