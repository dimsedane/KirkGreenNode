var database = require('../data.js');
var helpers = require('../helpers.js');


module.exports.init = function(socket){
    socket.on('updateOrders', function (data) {
        getOrders(socket,data);
    });    
        
    socket.on('updateOrderItem',function(data){
        updateOrderItem(socket,data);
    });
    
    socket.on('createOrder',function(data){
        createOrder(socket,data);
    });
    
    socket.on('deleteOrder',function(data){
        deleteOrder(socket,data);
    });

}

function getOrders(socket,data){
    if(!helpers.validateInput(data,{})){ socket.emit('error',{error: "There was an error with the request"}); return;}
    if(socket.handshake.session.username === undefined || socket.handshake.session.username === null){
        socket.emit('authError',{error:'You must be logged in to access this page.'});
        
    } else {
        database.Order.find({},function(err, orders){
            if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
    
            socket.emit('orders',orders);
        });
    }
}

function deleteOrder(socket,data){
    if(!helpers.validateInput(data,{
        date: "Required"
    })){ socket.emit('error',{error: "There was an error with the request"}); return;}
    
    if(socket.handshake.session.username === undefined || socket.handshake.session.username === null){
        socket.emit('authError',{error:'You must be logged in to access this page.'});
    } else {
        database.Order.findOneAndRemove({date: data.date},function(err,order){
            if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
            
            database.Order.find({},function(err, orders){
                if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
    
                socket.emit('orders',orders);
            });
        });
    }
}

function createOrder(socket,data){
    if(!helpers.validateInput(data,{
        date: "Required"
    })){ socket.emit('error',{error: "There was an error with the request"}); return;}

    if(socket.handshake.session.username === undefined || socket.handshake.session.username === null){
        socket.emit('authError',{error:'You must be logged in to access this page.'});
    } else {        
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

function updateOrderItem(socket,data){
    if(!helpers.validateInput(data,{
        orderId: "Required",
        type: "Required",
        customer: "Required",
        newValue: "Required"
    })){ socket.emit('error',{error: "There was an error with the request"}); return;}
    
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