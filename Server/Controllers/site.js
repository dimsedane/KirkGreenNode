module.exports = {
    action_index: function(request,response){
        response.writeHead(200, {'Content-Type': 'text/html'} );
        
        response.write('Yay, it workded :D');
        
        response.end();        
    }   
}