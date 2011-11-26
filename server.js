/*
 * Node.js + Comet example using Faye.
 *
 * Mostly derived from the Faye examples: http://github.com/jcoglan/faye
 * And from this lovely post: http://bit.ly/bqkQ9O.
 *
 * Usage: node server.js [port]
 *
 * Starts an http server on port [port], defaults to 8000.
 * Then by navigating to http://127.0.0.1:[port], magic will happen.
 * Client currently configured to wait for messages from the server. Server
 * Sends messages via stdin.
 */


var fs    = require('fs'),
    path  = require('path'),
    sys   = require('util'),
    http  = require('http')
    faye  = require('./faye');

var PUBLIC_DIR = path.dirname(__filename),
    server     = new faye.NodeAdapter({mount: '/comet', timeout: 45}),
    client     = server.getClient();
    port       = '8000';

sys.puts('Listening on ' + port);

http.createServer(function(request, response) {
    sys.puts(request.method + ' ' + request.url);

    // handle Comet request -- haaaaaaaaannnnng.
    if (server.call(request, response)) return;

    var path = (request.url === '/') ? '/index.htm' : request.url;
    fs.readFile(PUBLIC_DIR + path, function(err, content) {
        if (content == null || content.length < 2) {
            sys.puts("404!");
            response.setHeader("404",{});
            response.write("Not found!");
            response.end();
        } else {
            response.setHeader("200", {'Content-Type': 'text/html'});
            response.write(content);
            response.end();
        }
    });
}).listen(Number(port));

/* Send stdin to the client */
var stdin = process.openStdin();
stdin.setEncoding('utf8');

stdin.addListener('data', function(chunk) {
    client.publish('/node_comet', {msg: chunk});
});
