var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect('mongodb://localhost/kirkgreen');
    
var db = module.exports.db =  mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    var orderItemSchema = new mongoose.Schema({
        type: String,
        customer: String,
        amount: Number
    });
    
    var orderSchema = new mongoose.Schema({
        date: Number,
        orderItems: [orderItemSchema],
    });
    
    var seasonSchema = new mongoose.Schema({
        name: String
    });
    
    var userSchema = new mongoose.Schema({
       name: String,
       realName: String, 
       password: String
    });
    
    module.exports.OrderItem = mongoose.model('OrderItem',orderItemSchema);
    module.exports.Order = mongoose.model('Order',orderSchema);
    module.exports.Season = mongoose.model('Season',seasonSchema);
    module.exports.User = mongoose.model('User',userSchema);    
});