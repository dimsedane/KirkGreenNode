var socket = io.connect('http://localhost');

socket.on('logoutComplete',function(data){
    window.location = "/index.html";
});

socket.on('userUpdated',function(data){
    if(!data.username){ //Create the signin form
        $('#userContainer').replaceWith('<li id="userContainer" class="dropdown"><a class="dropdown-toggle" href="#" data-toggle="dropdown">Sign In <strong class="caret"></strong></a> <div class="dropdown-menu" style="padding: 15px; padding-bottom: 0px;"><form id="loginForm" action="#" accept-charset="UTF-8"> <input id="login_username" placeholder="Username" style="margin-bottom: 15px;" type="text" size="30" /> <input id="login_password" placeholder="Password" style="margin-bottom: 15px;" type="password" size="30" /> <input class="btn btn-primary" style="clear: left; width: 100%; height: 32px; font-size: 13px;" type="submit" name="commit" value="Sign In" /></form></div></li>');
        
        $('#loginForm').submit(function(){
            var username = $('#login_username').val();
            var password = $('#login_password').val();
            
            socket.emit('login',{'name': username, 'password': password});
        });
        
    } else { 
        $('#userContainer').replaceWith('<li id="userContainer" class="dropdown"><a class="dropdown-toggle" href="#" data-toggle="dropdown">' + data.username + '<strong class="caret"></strong></a> <ul class="dropdown-menu"><li><a id="logoutLink" href="#">Signout</a></li></ul></li>');
        
        $('#logoutLink').click(function(){
            socket.emit('logout',{}); 
        });
    }
});

socket.on('authError',function(data){
    var authModal = '<div id="authModal" class="modal hide fade"><div class="modal-header"><h3>An error occured</h3></div><div class="modal-body"><p>';
    
    authModal += data.error;
    authModal += '</p></div><div class="modal-footer"><a href="index.html" class="btn btn-primary">Ok</a></div></div>';
    
    $('body').html(authModal);
    
    $('#authModal').modal({keyboard: false});  
});

$(function(){
    createNavbar();
    
    socket.emit('getUser',{});
});

function createNavbar(){
    //Get the current file name
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
    
    var navbarHtml = '<div class="navbar navbar-inverse navbar-static-top"> <div class="navbar-inner"> <div class="container"> <a class="brand" href="#">KirkGreen</a> <ul class="nav">';
    
    //Add Home Link
    navbarHtml += '<li';
    navbarHtml += filename === 'index.html' ? ' class="active" ' : '';
    navbarHtml += '><a href="index.html">Home</a></li>';
    
    //Add Orders Link
    navbarHtml += '<li';
    navbarHtml += filename === 'orders.html' ? ' class="active" ' : '';
    navbarHtml += '><a href="orders.html">Orders</a></li>';
    
    //Add Orders Link
    navbarHtml += '<li';
    navbarHtml += filename === 'configure.html' ? ' class="active" ' : '';
    navbarHtml += '><a href="configure.html">Configure</a></li>';
    
    
    navbarHtml += '</ul><ul class="nav pull-right"><li id="userContainer"></li></ul></div></div></div>';
    
    
    $('#navbarContainer').html(navbarHtml);
}