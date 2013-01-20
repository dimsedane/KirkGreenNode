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
    socket.on('updateOrders', function (data) {
        order.getOrders(socket,data);
    });    
        
    socket.on('updateOrderItem',function(data){
        order.updateOrderItem(socket,data);
    });
    
    socket.on('createOrder',function(data){
        order.createOrder(socket,data);
    });
    
    socket.on('deleteOrder',function(data){
        order.deleteOrder(socket,data);
    });
    
    //UserController
    socket.on('createUser',function(data){
        user.createUser(socket,data);
    });
    
    socket.on('login', function(data){
        user.login(socket,data); 
    });
    
    socket.on('getUser', function(data){
        user.getUser(socket,data);
    });
    
    socket.on('logout',function(data){
       user.logout(socket,data); 
    });

});
var database = require('./data.js');

app.get('/generate/rdf/',function(req,res){
    database.Order.find({},function(err, orders){
        if(err) { console.log(err); res.end(); return;}      
        
        var body = '';
        
        body += '<?xml version="1.0"?>';
        body += '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:order="http://dimsedane.dk/order.rdfs#">';
    
        body += '<rdf:Description rdf:about="http://www.kirkgreen.dk/">'
        
        orders.forEach(function(order){
           body += '<order:Order><rdf:Bag rdf:about="order://kirkgreen/';
           body += order.date;
           body += '">';
            
           order.orderItems.forEach(function(orderItem){
              body += '<order:OrderItem><rdf:Description>';
              body += '<order:Customer><rdf:Description rdf:about="customer://kirkgreen/';
              body += orderItem.customer;
              body += '"/></order:Customer>';
              body += '<order:Type><rdf:Description rdf:about="type://kirkgreen/';
              body += orderItem.type;
              body += '"/></order:Type>';
              body += '<order:Amount rdf:datatype="http://www.w3.org/2001/XMLSchema#int">';
              body += orderItem.amount;
              body += '</order:Amount>';
              body += '</rdf:Description></order:OrderItem>'; 
           });
           body += '</rdf:Bag></order:Order>';
        });
        body += '</rdf:Description>';
        body += '</rdf:RDF>';
        
        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });
});

server.listen(port);
console.log("Server Running on " + port);