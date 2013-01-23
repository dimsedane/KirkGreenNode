var database = require('../data.js');
var crypto = require('crypto');
var helpers = require('../helpers.js');

module.exports.init = init;
function init(socket){
    socket.on('createUser',function(data){
        createUser(socket,data);
    });
    
    socket.on('login', function(data){
        login(socket,data); 
    });
    
    socket.on('getUser', function(data){
        getUser(socket,data);
    });
    
    socket.on('logout',function(data){
       logout(socket,data); 
    });

}

function login(socket,data,session){
    //Ensure data is correctly formatted
    if(!helpers.validateInput(data,{
        name: "Required",
        password: "Required"
    })){ socket.emit('error',{error: "There was an error with the request"}); return;}
    
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

function logout(socket,data){
    //Ensure data is correctly formatted
    if(!helpers.validateInput(data,{})){ socket.emit('error',{error: "There was an error with the request"}); return;}
    delete socket.handshake.session.username;
    socket.handshake.session.touch().save();
    socket.emit('userUpdated',{});
    socket.emit('logoutComplete',{});
}

function createUser(socket,data){
    //Ensure data is correctly formatted
    if(!helpers.validateInput(data,{
        name: "Required",
        password: "Required",
        realname: "Required"
    })){ socket.emit('error',{error: "There was an error with the request"}); return;}
    
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

function getUser(socket,data){
    //Ensure data is correctly formatted
    if(!helpers.validateInput(data,{})){ socket.emit('error',{error: "There was an error with the request"}); return;}
    socket.emit('userUpdated',{username: socket.handshake.session.username});
}