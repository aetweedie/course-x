var routes = require('routes')();
var fs = require('fs');
var db = require('monk')('localhost/course-x');
var courses = db.get('courses');
var qs = require('qs');
var view = require('mustache');
var mime = require('mime');

routes.addRoute ('/courses', function (req, res, url) {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html');
      courses.find({}, function (err, docs) {
        var file = fs.readFileSync('templates/courses/index.html');
        var template = view.render(file.toString(), { courses: docs });
        res.end(template);
      });
    }
  if (req.method === 'POST') {
    var data = '';
    req.on ('data', function (chunk) {
      data += chunk;
    });
    req.on('end', function() {
      var course = qs.parse(data);
      courses.insert(course, function (err, doc) {
        if (err) throw (err);
        res.writeHead(302, {'location': '/courses'});
        res.end();
      });
    });
  }
});

routes.addRoute('/courses/new', function(req, res, url) {
  res.setHeader('Content-Type', 'text/html');
    var file = fs.readFileSync('templates/courses/new.html');
    var template = view.render(file.toString(), {});
    res.end(template);
});

routes.addRoute ('/courses/:id', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    url = url.params.id;
    courses.findOne({_id: url}, function (err, docs) {
      var file = fs.readFileSync('templates/courses/show.html');
      var template = view.render(file.toString(), {
        _id: docs._id,
        name: docs.name,
        author: docs.author,
        description: docs.description,
        rating: docs.rating,
        category: docs.category,
        image: docs.image,
        url: docs.url,
        });
      res.end(template);
    });
  }
});

routes.addRoute('/courses/:id/edit', function (req, res, url) {
  console.log(req.url)
  console.log(req.method)
  if (req.method === 'GET') {
    courses.findOne({ _id: url.params.id }, function(err, doc) {
      if (err) console.log(err);
      var file = fs.readFileSync('templates/courses/edit.html');
      var template = view.render(file.toString(), doc);
      res.end(template);
    });
  }
});

routes.addRoute('/courses/:id/update', function (req, res, url) {
  if (req.method === 'POST') {
    var data = '';
    req.on('data', function (chunk) {
      data += chunk;
    });
    req.on('end', function () {
      var course = qs.parse(data);
      courses.update({_id: url.params.id}, course, function(err, doc) {
        if (err) console.log(err);
        res.writeHead(302, {'Location': '/courses'});
        res.end();
      });
    });
  }
});

routes.addRoute('/courses/:id/delete', function(req, res, url){
  if (req.method === 'POST') {
    res.setHeader('Content-Type', 'text/html');
    courses.remove({_id: url.params.id}, function (err, doc) {
      if (err) console.log(err);
      res.writeHead (302, {location: '/courses'});
      res.end();
    });
  }
});

routes.addRoute ('/public/*', function(req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url));
  fs.readFile ('.' + req.url, function(err, file){
    if (err) {
      res.setHeader('Content-Type', 'text/html');
      res.end('404');
    }
    res.end(file);
  });
});

routes.addRoute('/', function (req, res, url) {
  if (req.method === 'GET') {
    courses.find({}, function(err, doc) {
      if (err) console.log(err);
      var file = fs.readFileSync('templates/courses/splash.html');
      var template = view.render(file.toString(), doc);
      res.end(template);
    });
  }
});

module.exports = routes;
