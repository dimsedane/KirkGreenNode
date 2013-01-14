var database = require('../data.js');

module.exports.getOrders = getOrders;
function getOrders(socket,data){
    if(socket.handshake.session.username === undefined || socket.handshake.session.username === null){
        socket.emit('authError',{error:'You must be logged in to access this page.'});
        
    } else {
        database.Order.find({},function(err, orders){
            if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
    
            socket.emit('orders',orders);
        });
    }
}

module.exports.deleteOrder = deleteOrder;
function deleteOrder(socket,data){
    if(socket.handshake.session.username === undefined || socket.handshake.session.username === null){
        socket.emit('authError',{error:'You must be logged in to access this page.'});
    } else {
        if(data.date === undefined){
            socket.emit('error',{error: "There was a problem with the request"});
            return;
        }
        
        database.Order.findOneAndRemove({date: data.date},function(err,order){
            if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
            
            database.Order.find({},function(err, orders){
                if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
    
                socket.emit('orders',orders);
            });
        });
    }
}

module.exports.createOrder = createOrder;
function createOrder(socket,data){
    if(socket.handshake.session.username === undefined || socket.handshake.session.username === null){
        socket.emit('authError',{error:'You must be logged in to access this page.'});
    } else {
        if(data.date === undefined){
            socket.emit('error',{error: "There was a problem with the request"});
            return;
        }
        
        var dateSplit = data.date.split('/');
        
        var day = dateSplit[0];
        var month = dateSplit[1];
        var year = dateSplit[2];
        
        var date = new Date(year, month, day, 0, 0, 0, 0);
        
        var order = new database.Order;
        
        order.date = date.getTime();
        
        order.orderItems[0] = new database.OrderItem;
        order.orderItems[0].type = 'NGR';
        order.orderItems[0].customer = "Fjerritslev Kirke";
        order.orderItems[0].amount = 0;
        
        order.orderItems[1] = new database.OrderItem;
        order.orderItems[1].type = 'NGR';
        order.orderItems[1].customer = "Hjortdal Kirke";
        order.orderItems[1].amount = 0;
        
        order.orderItems[2] = new database.OrderItem;
        order.orderItems[2].type = 'NOB';
        order.orderItems[2].customer = "Fjerritslev Kirke";
        order.orderItems[2].amount = 0;
        
        order.orderItems[3] = new database.OrderItem;
        order.orderItems[3].type = 'NOB';
        order.orderItems[3].customer = "Hjortdal Kirke";
        order.orderItems[3].amount = 0;
        
        order.save(function(err, order){
            database.Order.find({},function(err, orders){
                if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
    
                socket.emit('orders',orders);
            });
        });
    }
}

module.exports.updateOrderItem = updateOrderItem;
function updateOrderItem(socket,data){
    if(socket.handshake.session.username === undefined || socket.handshake.session.username === null){
        socket.emit('authError',{error:'You must be logged in to access this page.'});
        
    } else {
        database.Order.findOne({'_id': data.orderId},function(err, order){
            if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
        
            var found = false;
        
            order.orderItems.forEach(function(orderItem){
                if(orderItem.type == data.type && orderItem.customer == data.customer){
                    orderItem.amount = data.newValue;
                    found = true;
                }
            });
        
            if(found){
                order.save(function(){
                    database.Order.find({},function(err, orders){
                        if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
        
                        socket.emit('newTotal',orders);
                    });
                });
            } else { 
                socket.emit('error',"No orderitem was found matching the provided data");
            }
        });
    }
}