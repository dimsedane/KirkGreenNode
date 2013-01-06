var util = require("util"),
my_http = require("http");
url = require('url');
var static = require('node-static');

var webroot = '../Client/',
  port = 8080;

//Lets try to get the controller/action thing going here

my_http.createServer(function(request,response){  
    if (request.url === '/favicon.ico') {
        response.writeHead(200, {'Content-Type': 'image/x-icon'} );
        response.end();
        console.log('favicon requested');
        return;
    }
    
    //response.writeHeader(200, {"Content-Type": "text/plain"});  
    
    var pathArray = (url.parse(request.url).pathname).split("/"); 
    
    var controllerName = pathArray[1];
    var actionName = pathArray[2] !== undefined ? pathArray[2] : 'index';
    var actionName = actionName !== "" ?  actionName : 'index';
    
    if(controllerName === 'Client'){
        //Strip the /client from the request
        
        request.url = request.url.replace(/^\/Client/g,"");
    
        var file = new(static.Server)(webroot, {
            cache: 600,
            headers: { 'X-Powered-By': 'node-static' }
        });    
        
        request.addListener('end', function() {
            file.serve(request, response, function(err, result) {
                if (err) {
                    console.error('Error serving %s - %s', request.url, err.message);
                    response.writeHead(err.status, err.headers);
                    response.end();
                } else {
                    console.log('%s - %s', request.url, response.message);
                }
            });
        });
    } else {
        util.log('Request for:');
        util.log('Controller: ' + controllerName);
        util.log('Action: ' + actionName);
        
        try{
            var controller = require('./Controllers/' + pathArray[1]);
        
            controller['action_' + actionName](request,response);
        } catch(err){
            console.log("Error:", err);
        
            response.writeHead(404);
            response.end();   
        }
    }
}).listen(8080);  

util.puts("Server Running on 8080");