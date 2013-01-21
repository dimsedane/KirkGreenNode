//Node modules
var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , util = require('util')
  , RedisStore = require('connect-redis')(express)
  , sessionStore = new RedisStore()
  , io = require('socket.io').listen(server)
  , cookieParser = express.cookieParser('OMGSECRET');

//My own modules
var order = require('./Controllers/order.js')
  , user  = require('./Controllers/user.js');

//Configuration settings
var webroot = '../Client/'
  , port = 80;

app.configure(function () {
  //hiding other express configuration
  app.use(express.cookieParser());
  app.use(express.session({ store: sessionStore, key: 'express.sid', secret: 'OMGSECRET'}));
});

app.use(logErrors);
app.use('/',express.static(__dirname + "/../Client"));

app.configure('development', function() {
    app.set('db-uri', 'mongodb://localhost/kirkgreen');
});

io.set('authorization', function (handshakeData, accept) {
    if (handshakeData.headers.cookie) {
        var signedCookies = require('express/node_modules/cookie').parse(handshakeData.headers.cookie);
        handshakeData.cookies = require('express/node_modules/connect/lib/utils').parseSignedCookies(signedCookies, 'OMGSECRET');
    
        handshakeData.sessionID = handshakeData.cookies['express.sid'];
    
        handshakeData.sessionStore = sessionStore;
        sessionStore.get(handshakeData.sessionID, function (err, session) {
            if (err || !session) {
                accept('Error', false);
            } else {
                // create a session object, passing data as request and our
                // just acquired session data
                var Session = require('connect').middleware.session.Session;
                handshakeData.session = new Session(handshakeData, session);
                accept(null, true);
            }
        });
    } else {
        return accept('No cookie transmitted.', false);
    } 
    accept(null, true);
});

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

io.sockets.on('connection', function (socket) {
    //OrderController
    order.init(socket);
        
    //UserController
    user.init(socket);
});

server.listen(port);
console.log("Server Running on " + port);