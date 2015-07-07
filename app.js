var http = require('http');
var router = require('./router');
var url = require('url');

var server = http.createServer(function (req, res) {
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
    return;
  }
  var path = url.parse(req.url).pathname;
  var currentRoute = router.match(path);
  currentRoute.fn(req, res, currentRoute);
});

server.listen(3456, function (err) {
  if (err) console.log('Broken', err);
  console.log('Server is running on port 3456');
});
