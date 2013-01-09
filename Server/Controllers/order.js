String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

module.exports.getOrders = getOrders;
function getOrders(socket,data){
    // Retrieve
    var MongoClient = require('mongodb').MongoClient;

    // Connect to the db
    MongoClient.connect("mongodb://localhost:27017/kirkgreen", function(err, db) {
        if(err) { console.log(err); socket.emit('error',{'error': err}); db.close(); return;}

        var seasonCollection = db.collection('seasons');
        
        seasonCollection.findOne({'name': data.season},function(err,result){
            if(err) { console.log(err); socket.emit('error',{'error': err}); db.close(); return;}
            
            var collection = db.collection('orders');
    
            collection.find({seasonId: result._id}).toArray(function(err,result){
                if(err) { console.log(err); socket.emit('error',{'error': err}); db.close(); return;}
            
                socket.emit('orders',result);
                db.close();
            });
        });
    });    
}

module.exports.getOrdersHash = getOrdersHash;
function getOrdersHash(request,response){
    // Retrieve
    var MongoClient = require('mongodb').MongoClient;

    // Connect to the db
    MongoClient.connect("mongodb://localhost:27017/kirkgreen", function(err, db) {
        if(err) { console.log(err); response.writeHead(500); response.end(); db.close(); return;}

        var collection = db.collection('orders');
            
        collection.find({}).toArray(function(err,result){
            if(err) { console.log(err); response.writeHead(500); reponse.end(); db.close(); return;}
                
            response.writeHead(200, {'Content-Type': 'text/javascript'} );
                
            response.write(JSON.stringify(result).hashCode());
        
            response.end();
        });
    });
}

module.exports.updateOrderItem = updateOrderItem;
function updateOrderItem(socket,data){
    // Retrieve
    var MongoClient = require('mongodb').MongoClient;

    // Connect to the db
    MongoClient.connect("mongodb://localhost:27017/kirkgreen", function(err, db) {
        if(err) { console.log(err); socket.emit('error',{'error': err}); db.close(); return;}

        var collection = db.collection('orders');
            
        console.log(data);
        collection.update({'_id': parseInt(data.orderId), 'orderItems.type': data.type, 'orderItems.customer': data.customer},{$set: {'orderItems.$.amount': parseInt(data.newValue)}},function(err,count){
            if(err) { console.log(err); socket.emit('error',{'error': err}); db.close(); return;}
            
            console.log('Elements updated: ' + count);
            
            collection.find({}).toArray(function(err,result){
                if(err) { console.log(err); socket.emit('error',{'error': err}); db.close(); return;}

                socket.emit('newTotal',result);
                db.close();
            });
            

        });
    });
}