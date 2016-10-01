// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// <script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js" type="text/javascript"></script>
// Create a client instance

// called when the client connects
var url = '' //Global URL variable
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log('onConnect');
  getCurrentTabUrl(function(u) {
    url = u
    client.subscribe(url)
    console.log('Subscribed to: ' + url)
  })

  // client.subscribe("/World");
  // message = new Paho.MQTT.Message("Hello");
  // message.destinationName = "/World";
  // client.send(message);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log('onConnectionLost: '+ responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log('onMessageArrived: ' + message.payloadString);
}

function sendMessage(messageText) {
  var message = new Paho.MQTT.Message(messageText)
  message.destinationName = url
  client.send(message)
}

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  client = new Paho.MQTT.Client('broker.hivemq.com', 8000, 'vansh');
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.connect({onSuccess:onConnect});
  renderStatus('Ayy it\'s lit')


  // getCurrentTabUrl(function(url) {
  //   renderStatus('Performing Google Image search for ' + url);

  //   getImageUrl(url, function(imageUrl, width, height) {

  //     renderStatus('Search term: ' + url + '\n' +
  //         'Google image search result: ' + imageUrl);
  //     var imageResult = document.getElementById('image-result');
  //     // Explicitly set the width/height to minimize the number of reflows. For
  //     // a single image, this does not matter, but if you're going to embed
  //     // multiple external images in your page, then the absence of width/height
  //     // attributes causes the popup to resize multiple times.
  //     imageResult.width = width;
  //     imageResult.height = height;
  //     imageResult.src = imageUrl;
  //     imageResult.hidden = false;

  //   }, function(errorMessage) {
  //     renderStatus('Cannot display image. ' + errorMessage);
  //   });
  // });
});
