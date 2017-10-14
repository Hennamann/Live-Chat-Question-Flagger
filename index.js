var express = require('express');
var app = require('express')();
var ipfilter = require('express-ipfilter').IpFilter;
var IpDeniedError = require('express-ipfilter').IpDeniedError;
var http = require('http').Server(app);
var favicon = require('serve-favicon');
var path = require('path')
var io = require('socket.io')(http);
var yt = require('youtube-live-chat');
var fb = require('facebook-live-chat');
var tw = require('twitch-webchat');
var jade = require('jade');
var EventEmitter = require('event-chains');
var jsesc = require('jsesc');
var unescapeJs = require('unescape-js');

//try {
//    var ipwhitelist = require(__dirname + "/ip-whitelist.json");
//} catch (e) {
//    console.log("Please create a ip-whitelist.json like ip-whitelist.example.json with whitelisted ip addresses.")
//}

// Checks for a JSON file containing important and secret credentials.
try {
    var authDetails = require(__dirname + "/auth.json");
} catch (e) {
    console.log("Please create an auth.json like auth.example.json with YouTube API credentials \n" + e.stack);
    process.exit();
}


var events = new EventEmitter();
//var ips = (ipwhitelist.ips);
var ytClient
var fbClient

function onTWStartSignal() {
    var twClient = tw.start(authDetails.twitch_channel_name, function (err, message) {
        if (err) throw err

        switch (message.type) {
            case 'chat': // chat message from the channel 
                var user = message.from
                var text = message.text // chat message content as text string 

                io.emit('chat message', 'tw-' + Math.floor((Math.random() * 100000000) + 1), 'https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png', jsesc(user), jsesc(text), user, text);
                break
            case 'tick':
            case 'debug':
            default:
        };
        events.on('stop', stop => {
            twClient.stop();
        })
    });
}

function onTWStopSignal() {
    console.log('[INFO/Twitch API]: Received Twitch stop signal.');
    events.emit('stop')
}

function onFBStopSignal() {
    console.log('[INFO/Facebook API]: Received Facebook stop signal.');
    fbClient.emit('stop', 'Received stop signal!');
}

function onFBStartSignal() {
    fbClient = new fb(authDetails.user_id, authDetails.user_access_token);

    fbClient.on('ready', () => {
        console.log('[INFO/Facebook Live API]:' + ' ready!');
        fbClient.listen(1100);
    })

    // if the facebook api fails, print the error output to console.
    fbClient.on('error', err => {
        console.log('[INFO/Facebook Live API]:' + ' ' + err);
    })
    // Emit every new facebook chat message to Socket.io.
    fbClient.on('chat', json => {
        io.emit('chat message', json.id, 'https://graph.facebook.com/v2.10/' + json.from.id + '/picture?type=large&redirect=true&access_token=' + authDetails.user_access_token, jsesc(json.from.name), jsesc(json.message), json.from.name, json.message);
    });

}

function onYTStopSignal() {
    console.log('[INFO/YouTube API]: Received YouTube stop signal.');
    ytClient.emit('stop', 'Received stop signal!');
}

function onYTStartSignal() {
    console.log('[INFO/YouTube API]: Received YouTube start signal.');
    console.log('[INFO/YouTube API]: Attempting to find live stream');

    // Connecting to the YT api using a channel id and youtube api key from the auth.json file.
    ytClient = new yt(authDetails.channel_id, authDetails.youtube_key);

    // Signal that the youtube api is ready.
    ytClient.on('ready', () => {
        console.log('[INFO/YouTube API]:' + ' ready!');
        ytClient.listen(1000);
    })

    // if the youtube api fails, print the error output to console.
    ytClient.on('error', err => {
        console.log('[INFO/YouTube API]:' + ' ' + err);
    })

    // Emit every new YT chat message to Socket.io.
    ytClient.on('chat', json => {
        io.emit('chat message', json.id, json.authorDetails.profileImageUrl, jsesc(json.authorDetails.displayName), jsesc(json.snippet.displayMessage), json.authorDetails.displayName, json.snippet.displayMessage);
    });
}

// Setup a public folder on the server and add a favicon.
app.use(express.static(path.join(__dirname, 'public')));
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(ipfilter(ips, { mode: 'allow' }));

app.set('view engine', 'jade');

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, _next) {
        console.log('Error handler', err);
        if (err instanceof IpDeniedError) {
            res.status(401);
        } else {
            res.status(err.status || 500);
        }

        res.render('error', {
            message: 'Access Denied!',
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, _next) {
    console.log('Error handler', err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Load and send the index.html file to the server client.
app.get('/', function (req, res) {
    console.log('[INFO/Express]:' + ' sending mainview.html to all connected clients')
    res.sendFile(__dirname + '/views/mainview.html');
});

app.get('/lowerthird', function (req, res) {
    console.log('[INFO/Express]:' + ' sending lowerthird.html to all requesting clients')
    res.sendFile(__dirname + '/views/lowerthird.html');
})

app.get('/startall', function (req, res) {
    console.log('[INFO/Express]:' + ' sending general start signal')
    res.send("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/styles.css\"><h1>Service start signal sent!</h1>")
    onYTStartSignal();
    onFBStartSignal();
    onTWStartSignal();
})

app.get('/stopall', function (req, res) {
    console.log('[INFO/Express]:' + ' sending general stop signal')
    res.send("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/styles.css\"><h1>Service stop signal sent!</h1>")
    onYTStopSignal();
    onFBStopSignal();
    onTWStopSignal();
})

app.get('/startyt', function (req, res) {
    console.log('[INFO/Express]:' + ' sending YouTube start signal')
    res.send("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/styles.css\"><h1>YouTube start signal sent!</h1>")
    onYTStartSignal();
})

app.get('/stopyt', function (req, res) {
    console.log('[INFO/Express]:' + ' sending YouTube stop signal')
    res.send("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/styles.css\"><h1>YouTube stop signal sent!</h1>")
    onYTStopSignal();
})

app.get('/startfb', function (req, res) {
    console.log('[INFO/Express]:' + ' sending Facebook start signal')
    res.send("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/styles.css\"><h1>Facebook start signal sent!</h1>")
    onFBStartSignal();
})

app.get('/stopfb', function (req, res) {
    console.log('[INFO/Express]:' + ' sending Facebook stop signal')
    res.send("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/styles.css\"><h1>Facebook stop signal sent!</h1>")
    onFBStopSignal();
})

app.get('/starttw', function (req, res) {
    console.log('[INFO/Express]:' + ' sending Twitch start signal')
    res.send("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/styles.css\"><h1>Twitch start signal sent!</h1>")
    onTWStartSignal();
})

app.get('/stoptw', function (req, res) {
    console.log('[INFO/Express]:' + ' sending Twitch stop signal')
    res.send("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/styles.css\"><h1>Twitch stop signal sent!</h1>")
    onTWStopSignal();
})

io.on('connection', function (socket) {

    socket.on('chat message', function (id, img, name, msg) {
        io.emit('chat message', id, img, unescapeJs(name), unescapeJs(msg));
    });

    socket.on('chat question', function (id, img, name, msg) {
        io.emit('chat question', id, img, unescapeJs(name), unescapeJs(msg));
    });

    socket.on('lower third', function (id, img, name, msg) {
        io.emit('lower third', id, img, unescapeJs(name), unescapeJs(msg));
    });

});

//Setup the web server on port 8080.
http.listen(8080, function () {
    console.log('[INFO/HTTP]:' + ' listening on localhost:8080');
});