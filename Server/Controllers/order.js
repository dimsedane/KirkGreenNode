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

module.exports = {
    action_getOrders: function(request,response){
        // Retrieve
        var MongoClient = require('mongodb').MongoClient;

        // Connect to the db
        MongoClient.connect("mongodb://localhost:27017/kirkgreen", function(err, db) {
            if(err) { console.log(err); response.writeHead(500); response.end(); db.close(); return;}

            var collection = db.collection('orders');
            
            collection.find({}).toArray(function(err,result){
                if(err) { console.log(err); response.writeHead(500); reponse.end(); db.close(); return;}
                
                response.writeHead(200, {'Content-Type': 'text/javascript'} );
                
                response.write(JSON.stringify(result));
        
                response.end();
            });
        });
    
    },
    action_getOrdersHash: function(request,response){
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
    },
    action_updateOrderItem: function(request,response){
            var qs = require('querystring');
        
            var body = '';
            request.on('data', function (data) {
                body += data;
                
                if (body.length > 1e6) {
                    // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                    response.writeHead(413);
                    response.end();
                    
                    console.log('Flood attack prevented');
                    
                    request.connection.destroy();
                }   
            });
            
            request.on('end', function () {
                var data = qs.parse(body);
                
                // Retrieve
                var MongoClient = require('mongodb').MongoClient;

                // Connect to the db
                MongoClient.connect("mongodb://localhost:27017/kirkgreen", function(err, db) {
                    if(err) { console.log(err); response.writeHead(500,err); response.end(); db.close(); return;}

                    var collection = db.collection('orders');
            
                    console.log(data);
                    collection.update({'_id': parseInt(data.orderId), 'orderItems.type': data.type, 'orderItems.customer': data.customer},{$set: {'orderItems.$.amount': parseInt(data.newValue)}},function(err,count){
                        if(err) { console.log(err); response.writeHead(500); db.close(); reponse.end(); return;}
                
                        console.log('Elements updated: ' + count);
                        response.writeHead(200);
                        response.end();
                        db.close();
                    });
                });
            });
    }
}