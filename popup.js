var url = '' //Global URL variable
var username = ''
var host = 'broker.hivemq.com'
var port = 8000

document.addEventListener('DOMContentLoaded', function() {
  renderStatus('Please pick a username')
  chooseUsername(function(username) {
    renderStatus('Connecting', false)
    connect(username)
  })
});

function sendUserName(callback, divContainer, submit) {
      var username = document.getElementById('username_value').value
      if (username) {
        divContainer.removeChild(submit)
        divContainer.parentNode.removeChild(divContainer)
        callback(username);
      }
}

function chooseUsername(callback) {
  var divContainer = document.createElement('div')
  var field = document.createElement('input')
  var label = document.createElement('label')
  var submit = document.createElement('a')
  var icon = document.createElement('i')

  divContainer.setAttribute('class', 'input-field col 6')

  field.setAttribute('type', 'text');
  field.setAttribute('id', 'username_value')
  field.setAttribute('autocomplete', 'off')
  field.setAttribute('class', '')
  field.onkeypress = function(e) {
    var key = e.charCode || e.keyCode || 0
    if (key == 13) {
      sendUserName(callback, divContainer, submit)
      e.preventDefault()
    }
  }
  
  label.setAttribute('for', 'username_value')
  label.setAttribute('class', 'deep-orange-text')
  label.textContent = 'Username'
  
  icon.setAttribute('class', 'material-icons')
  icon.textContent = 'arrow_forward'
  
  submit.setAttribute('class','btn-floating btn-small waves-effect waves-light deep-orange');
  submit.setAttribute('id', 'button_submit')
  submit.appendChild(icon)
  submit.addEventListener('click', function() {
    sendUserName(callback, divContainer, submit);
  })

  divContainer.appendChild(field)
  divContainer.appendChild(label)

  divContainer.appendChild(submit);
  document.getElementsByTagName('body')[0].appendChild(divContainer);
}

function onConnect() {
  console.log('Connected');
  getCurrentTabUrl(function(u) {
    url = u;
    client.subscribe(url);
    console.log('Subscribed to: ' + url);
    renderStatus('Connected', true)
    sendUserConnectedMessage();
  })

  document.getElementById("status").style.height="340px"
  makeMessageForm()
}

function onMessageArrived(messageObject) {
  console.log('onMessageArrived: ' + messageObject.payloadString);
  var message = messageObject.payloadString
  var index = message.indexOf('|')
  var messageToDisplay = index == -1 ? message : message.substring(0, index) + ": " + message.substring(index + 1)
  var parent = document.getElementById('status');
  var para = document.createElement("p");
  para.setAttribute('id', 'p2');
  var node = document.createTextNode(messageToDisplay);
  para.appendChild(node);
  parent.appendChild(para);

  if (parent.scrollTop > parent.scrollHeight - parent.clientHeight - 40)
  {
    parent.scrollTop = parent.scrollHeight;
    parent.animate({scrollTop: parent.scrollHeight});
  }
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
    url = tab.url;
    callback(url);
  });
}

function makeMessage() {
    var message = document.getElementById('message').value;
    if (message) {
      document.getElementById('message').value = ''
      sendMessage(message)
    }
}

function makeMessageForm () {
  var writeMessageDiv = document.createElement('div');
  var messageIcon = document.createElement('i')
  var messageInput = document.createElement('input');
  var messageLabel = document.createElement('label')
  var messageSubmit = document.createElement('a')
  var icon = document.createElement('i')

  writeMessageDiv.setAttribute('class', 'input-field col 6');

  messageIcon.setAttribute('class', 'material-icons prefix')
  messageIcon.textContent = 'edit'

  messageInput.setAttribute('type', 'text');
  messageInput.setAttribute('autocomplete', 'off')
  messageInput.setAttribute('id', 'message');

  messageInput.onkeypress = function(e) {
    var key = e.charCode || e.keyCode || 0;
    if (key == 13) {
      makeMessage();
      e.preventDefault();
    }
  }
  
  messageLabel.setAttribute('for', 'message')
  messageLabel.textContent = 'Send Message...'

  icon.setAttribute('class', 'material-icons')
  icon.setAttribute('id', 'iconAttr');
  icon.textContent = 'send'

  
  messageSubmit.setAttribute('class','btn-floating btn-small waves-effect waves-light deep-orange');
  messageSubmit.setAttribute('id', 'message_submit')
  messageSubmit.appendChild(icon)
  messageSubmit.addEventListener('click', function() {
    makeMessage();
  })
  
  writeMessageDiv.appendChild(messageIcon);
  writeMessageDiv.appendChild(messageInput);
  writeMessageDiv.appendChild(messageLabel);
  writeMessageDiv.appendChild(messageSubmit)

  document.getElementsByTagName('body')[0].appendChild(writeMessageDiv);
}

function connect(u) {
  username = u //Set the global variable
  var randomizedUsername = username + '|' + Math.random().toString() //Randomized to ensure no clashes
  client = new Paho.MQTT.Client(host, port, randomizedUsername);
  client.onConnectionLost = onConnectionLost; //Set callbacks
  client.onMessageArrived = onMessageArrived;
  client.connect({onSuccess:onConnect}); //Connect
}

function renderStatus(statusText, isUrl) {
  if (isUrl)
    document.getElementById('status').innerHTML = statusText + " to " + url + '<br>' + "Happy CARMing :)";
  else
    document.getElementById('status').innerHTML = statusText;
}