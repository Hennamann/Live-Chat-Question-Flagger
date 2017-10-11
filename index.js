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
var jade = require('jade');

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

//var ips = (ipwhitelist.ips);
var ytClient
var fbClient

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
        io.emit('chat message', json.id, 'https://scontent.fsvg1-1.fna.fbcdn.net/v/t31.0-1/c379.0.1290.1290/10506738_10150004552801856_220367501106153455_o.jpg?oh=c388fe6f7c9e7d5f9a69dcd4208b0fd8&oe=5A7F107C', json.from.name, json.message);
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
    io.emit('chat message', json.id, json.authorDetails.profileImageUrl, json.authorDetails.displayName, json.snippet.displayMessage);
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
    res.send("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/styles.css\"><h1>Serivce start signal sent!</h1>")
    onYTStartSignal();
    onFBStartSignal();
})

app.get('/stopall', function (req, res) {
    console.log('[INFO/Express]:' + ' sending general stop signal')
    res.send("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/styles.css\"><h1>Serive stop signal sent!</h1>")
    onYTStopSignal();
    onFBStopSignal();
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

io.on('connection', function (socket) {

    socket.on('chat message', function (id, img, name, msg) {
        io.emit('chat message', id, img, name, msg);
    });

    socket.on('chat question', function (id, img, name, msg) {
        io.emit('chat question', id, img, name, msg);
    });

    socket.on('lower third', function (id, img, name, msg) {
        io.emit('lower third', id, img, name, msg);
    });

});

//Setup the web server on port 8080.
http.listen(8080, function () {
    console.log('[INFO/HTTP]:' + ' listening on localhost:8080');
});
