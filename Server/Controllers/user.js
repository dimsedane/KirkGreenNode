var database = require('../data.js');
var crypto = require('crypto');

module.exports.login = login;
function login(socket,data,session){
    //Ensure data is correctly formatted
    if(data.name === undefined || data.password === undefined){
        socket.emit('error',{error: "There was a problem with the request"});
        return;
    }
    
    var md5 = crypto.createHash('md5');
    
    md5.update(data.password,'utf8');
    
    var passwordDigest = md5.digest();
    
    database.User.find({name: data.name, password: passwordDigest},function(err,users){
        if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
        
        if(users.length === 1){
            socket.handshake.session.username = data.name;
            socket.handshake.session.touch().save();
            socket.set('username',data.name,function(){
                socket.emit('userUpdated',{username: data.name});
            });
        }
    });
}

module.exports.logout = logout;
function logout(socket,data){
    socket.handshake.session.destroy();
}

module.exports.createUser = createUser;
function createUser(socket,data){
    //Ensure data is correctly formatted
    if(data.name === undefined || data.password === undefined || data.realname === undefined){
        socket.emit('error',{error: "There was a problem with the request"});
        return;
    }
    
    database.User.find({name: data.name},function(err,users){
        if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
        
        if(users.length != 0)
            socket.emit('error', {error: 'The user already exists.'});
            
        var md5 = crypto.createHash('md5');
    
        md5.update(data.password,'utf8');
    
        var passwordDigest = md5.digest();   
            
        var newUser = new database.User({
            name: data.name,
            realName: data.realname,
            password: passwordDigest
        });
        
        newUser.save(function(err,user){
            if(err) { console.log(err); socket.emit('error',{'error': err}); return;}
            
            socket.emit('userUpdate',{username: user.name});
        })
    });
}

module.exports.getUser = getUser;
function getUser(socket,data,session){
        socket.emit('userUpdated',{username: socket.handshake.session.username});
}
