// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// <script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js" type="text/javascript"></script>
// Create a client instance

// called when the client connects

var url = '' //Global URL variable
var username = ''
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log('onConnect');
  getCurrentTabUrl(function(u) {
    url = u;
    client.subscribe(url);
    console.log('Subscribed to: ' + url);
    sendUserConnectedMessage();
  })

  makeMessageForm(function (message)
  {
      sendMessage(message);
  })
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log('onConnectionLost: '+ responseObject.errorMessage);
  }
  connect()
}

// called when a message arrives

function onMessageArrived(messageObject) {
  console.log('onMessageArrived: ' + messageObject.payloadString);
  var message = messageObject.payloadString
  var index = message.indexOf('|')
  if (index != -1) {
    var senderUsername = message.substring(0, index)
    var actualMessage = message.substring(index + 1)
    var messageToDisplay = senderUsername + ': ' + actualMessage
  } else {
    var messageToDisplay = message
  }
  var parent = document.getElementById('status');
  var para = document.createElement("p");
  var node = document.createTextNode(messageToDisplay);
  para.appendChild(node);
  parent.appendChild(para);
}

function basicSendMessage(messageText, channel) {
  var message = new Paho.MQTT.Message(messageText)
  message.destinationName = channel
  client.send(message)
}

function sendMessage(messageText) {
  basicSendMessage(username + '|' + messageText, url)
}

function sendUserConnectedMessage() {
  basicSendMessage(username + 'has joined', url)
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
}

function chooseUsername(callback) {
  var container = document.getElementById('username_container')
  var form = document.createElement('form')
  var field = document.createElement('input')
  var submit = document.createElement('button')

  field.setAttribute('type', 'text');
  field.setAttribute('name', 'username')
  field.setAttribute('id', 'username_value')

  submit.setAttribute('type','button');
  submit.textContent = 'Submit'
  submit.addEventListener('click', function() {
    console.log("Submit button clicked")
    var username = document.getElementById('username_value').value
    console.log("Username: " + username)
    form.parentNode.removeChild(submit)
    form.parentNode.removeChild(form)
    callback(username)
  })

  form.appendChild(field)

  document.getElementsByTagName('body')[0].appendChild(form);
  document.getElementsByTagName('body')[0].appendChild(submit);
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function makeMessageForm (callback)
{
  var parent = document.getElementById('status');
  var writeMessageForm = document.createElement("form");
  writeMessageForm.setAttribute('id', 'form');
  var messageInput = document.createElement("input");
  messageInput.setAttribute('type', 'text');
  messageInput.setAttribute('id', 'message');
  var messageSubmit = document.createElement("input");
  messageSubmit.setAttribute('type', 'button');
  messageSubmit.setAttribute('value', 'Submit');

  messageSubmit.addEventListener('click', function() {
    console.log("Submit button clicked");
    var message = document.getElementById('message').value;
    console.log("The message was: " + message);
    document.getElementById('form').reset();
    callback(message);
    return false;
  })
  
  writeMessageForm.appendChild(messageInput);
  writeMessageForm.appendChild(messageSubmit);
  // parent.appendChild(writeMessageForm);

  document.getElementsByTagName('body')[0].appendChild(writeMessageForm);
}

function connect(u) {
  username = u
  var randomizedUsername = username + '|' + Math.random().toString()  
  client = new Paho.MQTT.Client('broker.hivemq.com', 8000, randomizedUsername);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.connect({onSuccess:onConnect});
}

document.addEventListener('DOMContentLoaded', function() {
  chooseUsername(function(username) {
    renderStatus('Connecting')
    connect(username)
  })
});
