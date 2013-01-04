var sys = require("sys"),  
my_http = require("http");
url = require('url');

//Lets try to get the controller/action thing going here

my_http.createServer(function(request,response){  
    sys.puts("I got kicked");  
    response.writeHeader(200, {"Content-Type": "text/plain"});  
    response.write(url.parse(request.url).pathname);
    response.end();  
}).listen(8080);  

sys.puts("Server Running on 8080");