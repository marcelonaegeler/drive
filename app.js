"use strict";
var express = require('express')
	, app = express()
	, bodyParser = require('body-parser')
	, db = require('monk')('localhost:27017/drive')
	, _ = require('underscore')
	, multiparty = require('multiparty')
	;

// Configs
app.set('view engine', 'jade');
app.set('views', './views');
app.set('view cache', false);
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Pass the DB connection to the routes
app.use(function(req, res, next){
  req.db = db;
  next();
});

// Routes
app.get('/', function(req, res) {
	var root = db.get('directories');
	root.findOne({ root: true }, function(err, doc) {
		if(err) throw err;
		if(!doc) {
			root.insert({ name: 'Drive', root: true, parent: null });
		}
		return res.render('index', { title: 'Drive' });
	});
});

app.get('/api/items/?(:id)?', function(req, res) {
	var currentDirectory = {}
		, data = {};

	var renderView = _.after(3, response);

	var directories = db.get('directories');
	directories.find({ parent: req.params.id ? req.params.id : 'root' }, function(err, docs) {
		if(err) throw err;
		data.directories = docs;
		renderView();
	});

	var toSearch = req.params.id ? { _id: req.params.id } : { root: true };
	directories.findOne(toSearch, function(err, doc) {
		if(err) throw err;
		data.currentDirectory = doc;
		renderView();
	});

	var files = db.get('files');
	files.find({}, function(err, docs) {
		if(err) throw err;
		data.files = docs;
		renderView();
	});


	function response() {
		return res.send(data);
	}
});

app.post('/api/mkdir', function(req, res) {
	var directories = db.get('directories');
	directories.insert({ name: req.body.name, parent: req.body.parent }, function(err, docs) {
		var response = { status: 0, message: '' };
		if(err) {
			response.status = 1;
			response.message = err;
		}
		return res.send(response);
	});
});

app.post('/api/upload', function(req, res) {
 	var form = new multiparty.Form();
 	form.parse(req, function(err, fields, files) {
		return res.send({ fields: fields, files: files });
 	});
});

app.post('/api/rmdir', function(req, res) {
	if(!req.body._id) return res.send({ status: 1 });
	var directories = db.get('directories');
	directories.remove({ _id: req.body._id });
	return res.send({ status: 0 });
});

app.post('/api/renameDir', function(req, res) {
	if(!req.body._id || !req.body.name) return res.send({ status: 1 });
	var directories = db.get('directories');
	directories.findById(req.body._id, function(err, doc) {
		if(err) throw err;
		doc.name = req.body.name;
		directories.update({ _id: doc._id }, doc, function(ok) {
			return res.send({ status: 0 });
		});
	});
});

app.get('/*', function(req, res) {
	res.redirect('/');
});

var server = app.listen(3001, function() {
	var host = server.address().address
		, port = server.address().port;
	console.log('Drive app listening at http://%s:%s', host, port);
});
