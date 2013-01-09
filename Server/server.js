//Node modules
var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

//My own modules
var order = require('./Controllers/order.js');

//Configuration settings
var webroot = '../Client/'
  , port = 80;

app.use(logErrors);
app.use('/',express.static(__dirname + "/../Client"));

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

io.sockets.on('connection', function (socket) {
    socket.on('updateOrders', function (data) {
        order.getOrders(socket,data);
    });
    
    socket.on('updateOrderItem',function(data){
        order.updateOrderItem(socket,data);
    });
});

server.listen(port);
console.log("Server Running on " + port);