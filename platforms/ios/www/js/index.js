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
    var inputEl = elID('address-input');
    inputEl.addEventListener('keypress', onPressEnterInputField);
    getLatLngBtn.addEventListener('click', handleClickGetLatLng);
  },

  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
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

function getLatLong(address) {
  return axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: {
      address: 'Hanhitie 17, Oulu 90150, Finland',
      key: 'AIzaSyAmyYNlxuCGvftIhFlKACAqwRbBPDqtySI'
    }
  });
}

function handleClickGetLatLng() {
  var address = elID('address-input').value;
  var outputEl = elID('lat-long-content');
  getLatLong(address)
    .then(function(response) {
      var location = response.data.results[0].geometry.location;
      var latitude = location.lat;
      var longitude = location.lng;
      outputEl.innerHTML =
        'Latitude: ' + latitude + ', Longitude: ' + longitude;
    })
    .catch(function(err) {
      outputEl.innerHTML = err;
    });
}

function mapIsReady() {
  map = new google.maps.Map(elID('map'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8
  });
}

app.initialize();
