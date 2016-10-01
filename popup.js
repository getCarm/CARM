var url = '' //Global URL variable
var username = ''

document.addEventListener('DOMContentLoaded', function() {
  chooseUsername(function(username) {
    renderStatus('Connecting')
    connect(username)
  })
});

function chooseUsername(callback) {
  var form = document.createElement('form')
  var field = document.createElement('input')
  var submit = document.createElement('button')

  field.setAttribute('type', 'text');
  field.setAttribute('id', 'username_value')

  submit.setAttribute('type','button');
  submit.textContent = 'Submit'
  submit.addEventListener('click', function() {
    var username = document.getElementById('username_value').value
    form.parentNode.removeChild(submit)
    form.parentNode.removeChild(form)
    callback(username)
  })

  form.appendChild(field)

  document.getElementsByTagName('body')[0].appendChild(form);
  document.getElementsByTagName('body')[0].appendChild(submit);
}


function onConnect() {
  console.log('Connected');
  getCurrentTabUrl(function(u) {
    url = u;
    client.subscribe(url);
    console.log('Subscribed to: ' + url);
    sendUserConnectedMessage();
  })
  makeMessageForm()
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

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log('onConnectionLost: '+ responseObject.errorMessage);
  }
  connect()
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
  basicSendMessage(username + ' has joined', url)
}

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    callback(url);
  });
}

function makeMessageForm ()
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
    sendMessage(message)
    return false;
  })
  
  writeMessageForm.appendChild(messageInput);
  writeMessageForm.appendChild(messageSubmit);

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

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}