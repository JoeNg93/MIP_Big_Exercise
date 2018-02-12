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
    var getLatLngBtn = elID('get-lat-lon-btn');
    var getCurrentLocationBtn = elID('get-current-location-btn');
    var inputEl = elID('address-input');
    inputEl.addEventListener('keypress', onPressEnterInputField);
    getLatLngBtn.addEventListener('click', handleClickGetLatLng);
    getCurrentLocationBtn.addEventListener(
      'click',
      handleClickGetCurrentLocation
    );
  }
};

function elID(id) {
  return document.getElementById(id);
}

function onPressEnterInputField(evt) {
  if (evt.keyCode === 13) {
    getLatLong();
  }
}

function getLatLng(address) {
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
  var yourLocationEl = elID('your-location');
  yourLocationEl.innerHTML = 'Getting your current location. Please wait...';
  getCurrentPosition()
    .then(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var locationObj = {
        lat: lat,
        lng: lng
      };
      addMarkerToMap(locationObj, map);
      map.setCenter(locationObj);
      yourLocationEl.innerHTML =
        'Your location: ' + lat + ' (lat), ' + lng + ' (lng)';
    })
    .catch(function(reason) {
      yourLocationEl.innerHTML =
        'Cannot get current location. Error: ' + reason.message;
    });
}

function handleClickGetLatLng() {
  var outputEl = elID('lat-long-content');
  var inputEl = elID('address-input');
  var address = inputEl.value;
  getLatLng(address)
    .then(function(results) {
      inputEl.value = results[0].formatted_address;
      var location = results[0].geometry.location;
      var locationObj = {
        lat: location.lat(),
        lng: location.lng()
      };
      outputEl.innerHTML =
        'Latitude: ' + locationObj.lat + ', Longitude: ' + locationObj.lng;
      addMarkerToMap(locationObj, map);
      map.setCenter(locationObj);
    })
    .catch(function(reason) {
      outputEl.innerHTML = reason;
    });
}

function mapIsReady() {
  map = new google.maps.Map(elID('map'), {
    center: { lat: 65.0120888, lng: 25.46507719996 },
    zoom: 13
  });
  geocoder = new google.maps.Geocoder();
}

function addMarkerToMap(position, map) {
  var marker = new google.maps.Marker({
    position: position,
    map: map
  });
}

app.initialize();
