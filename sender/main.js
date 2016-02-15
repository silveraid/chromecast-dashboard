/**
 * Main JavaScript for handling Chromecast interactions.
 */

var applicationID = '89D0DD51';
var namespace = 'urn:x-cast:com.boombatower.chromecast-dashboard';
var session = null;

if (!chrome.cast || !chrome.cast.isAvailable) {
  setTimeout(initializeCastApi, 1000);
}

function initializeCastApi() {
  var sessionRequest = new chrome.cast.SessionRequest(applicationID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    sessionListener,
    receiverListener);

  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

function onInitSuccess() {
  console.log('onInitSuccess');
}

function onError(message) {
  console.log('onError: ' + JSON.stringify(message));
}

function onSuccess(message) {
  console.log('onSuccess: ' + JSON.stringify(message));

  if (message['type'] == 'load') {
    $('#kill').prop('disabled', false);
    $('#post-note').show();
  }
}

function onStopAppSuccess() {
  console.log('onStopAppSuccess');

  $('#kill').prop('disabled', true);
  $('#post-note').hide();
}

function sessionListener(e) {
  console.log('New session ID: ' + e.sessionId);
  session = e;
  session.addUpdateListener(sessionUpdateListener);
}

function sessionUpdateListener(isAlive) {
  console.log((isAlive ? 'Session Updated' : 'Session Removed') + ': ' + session.sessionId);
  if (!isAlive) {
    session = null;
  }
};

function receiverListener(e) {
    
    if( e === 'available' ) {
        
        appendMessage("receiver found");
    }
    
    else {
        
        appendMessage("receiver list empty");
    }
}

function sendMessage(message) {
  if (session != null) {
    session.sendMessage(namespace, message, onSuccess.bind(this, message), onError);
  }
  else {
    chrome.cast.requestSession(function(e) {
      session = e;
      sessionListener(e);
      session.sendMessage(namespace, message, onSuccess.bind(this, message), onError);
    }, onError);
  }
}

function stopApp() {
  session.stop(onStopAppSuccess, onError);
}

function connect() {
  console.log('connect()');
  sendMessage({
    type: 'load',
    url: $('#url').val(),
    refresh: $('#refresh').val(),
  });
}

$('#kill').on('click', stopApp);
