var url = '' //Global URL variable
var username = ''
var host = 'broker.hivemq.com'
var port = 8000

document.addEventListener('DOMContentLoaded', function() {
  renderStatus('Please pick a username')
  chooseUsername(function(username) {
    renderStatus('Connecting')
    connect(username)
  })
});

function sendUserName(callback, form, submit)
{
      var username = document.getElementById('username_value').value
      form.parentNode.removeChild(submit)
      form.parentNode.removeChild(form)
      callback(username);
}

function chooseUsername(callback) {
  var form = document.createElement('form')
  var field = document.createElement('input')
  var label = document.createElement('label')
  var submit = document.createElement('a')
  var icon = document.createElement('i')

  form.setAttribute('id', 'form1');

  form.setAttribute('id', 'form1');

  field.setAttribute('type', 'text');
  field.setAttribute('id', 'username_value')
  field.setAttribute('autocomplete', 'off')
  
  label.setAttribute('for', 'username_value')
  label.textContent = 'Username'
  
  icon.setAttribute('class', 'material-icons')
  icon.textContent = 'arrow_forward'
  
  submit.setAttribute('class','btn-floating btn-large waves-effect waves-light red');
  submit.appendChild(icon)
  
  form.onkeypress = function(e)
  {
    var key = e.charCode || e.keyCode || 0;
    if (key == 13)
    {
      sendUserName(callback, form, submit);
      e.preventDefault();
    }
  }
  submit.addEventListener('click', function() {
    sendUserName(callback, form, submit);
    callback(username)
  })

  form.appendChild(field)
  form.appendChild(label)

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

function onMessageArrived(messageObject) {
  console.log('onMessageArrived: ' + messageObject.payloadString);
  var message = messageObject.payloadString
  var index = message.indexOf('|')
  var messageToDisplay = index == -1 ? message : message.substring(0, index) + ": " + message.substring(index + 1)
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
  basicSendMessage(username + '|' + messageText, url) //Encoding the username of the user into the message
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

function makeMessage()
{
    var message = document.getElementById('message').value;
    document.getElementById('form').reset();
    sendMessage(message)
}

function makeMessageForm () {
  var writeMessageForm = document.createElement('form');
  var messageInput = document.createElement('input');
  var messageSubmit = document.createElement('input');

  writeMessageForm.setAttribute('id', 'form');

  messageInput.setAttribute('type', 'text');
  messageInput.setAttribute('id', 'message');
  messageInput.setAttribute('autocomplete', 'off')

  messageSubmit.setAttribute('type', 'button');
  messageSubmit.setAttribute('value', 'Submit');

  writeMessageForm.onkeypress = function(e)
  {
    var key = e.charCode || e.keyCode || 0;
    if (key == 13)
    {
      makeMessage();
      e.preventDefault();
    }
  }

  messageSubmit.addEventListener('click', function() {
    makeMessage();
  })
  
  writeMessageForm.appendChild(messageInput);
  writeMessageForm.appendChild(messageSubmit);

  document.getElementsByTagName('body')[0].appendChild(writeMessageForm);
}

function connect(u) {
  username = u //Set the global variable
  var randomizedUsername = username + '|' + Math.random().toString() //Randomized to ensure no clashes
  client = new Paho.MQTT.Client(host, port, randomizedUsername);
  client.onConnectionLost = onConnectionLost; //Set callbacks
  client.onMessageArrived = onMessageArrived;
  client.connect({onSuccess:onConnect}); //Connect
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}