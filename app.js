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
	var directories = req.db.get('directories');
	directories.findOne({ parent: null }, function(err, doc) {
		if(err) throw err;
		if(!doc) {
			directories.insert({ name: 'Drive', ancestors: [], parent: null });
		}
		return res.render('index', { title: 'Drive' });
	});
});

app.get('/api/items/?(:parent)?', function(req, res) {
	var data = {};

	var renderView = _.after(3, function() {
		return res.send(data);
	});

	var directories = req.db.get('directories');
	directories.find({ parent: req.params.parent || null }, function(err, docs) {
		if(err) throw err;
		data.directories = docs;
		renderView();
	});

	directories.findOne({ _id: directories.id(req.params.parent) }, function(err, doc) {
		if(err) throw err;
		data.currentDirectory = doc;

		if(!doc || !doc.ancestors || !doc.ancestors.length)
			return renderView();

		for(var i = 0;  i < doc.ancestors.length; i++) {
			doc.ancestors[i] = directories.id(doc.ancestors[i]);
		}

		directories.find({ _id: { $in: doc.ancestors } }, [ '_id', 'name' ], function(err, docs) {
			if(err) throw err;
			data.currentDirectory.ancestors = docs;
			renderView();
		});
	});

	var files = req.db.get('files');
	files.find({}, function(err, docs) {
		if(err) throw err;
		data.files = docs;
		renderView();
	});
});

app.post('/api/mkdir', function(req, res) {
	var directories = req.db.get('directories');

	var dirData = {
		name: req.body.name
		, parent: req.body.parent
	};

	directories.findOne({ _id: dirData.parent }, [ 'ancestors' ], function(err, doc) {
		if(err) throw err;
		if(doc && doc.ancestors)
			dirData.ancestors = doc.ancestors;
		else
			dirData.ancestors = [];
		
		dirData.ancestors.push(dirData.parent);
		directories.insert(dirData, function() {
			return res.send({ status: 0 });
		});
	});
});

app.post('/api/upload', function(req, res) {
 	var form = new multiparty.Form();
 	form.parse(req, function(err, fields, files) {
		return res.send({ fields: fields, files: files });
 	});
});

app.post('/api/rmdir', function(req, res) {
	if(!req.body._id) return res.status(500).send({ status: 1 });
	var directories = req.db.get('directories');
	directories.find({ $or: [
			{ _id: directories.id(req.body._id) }
			, { ancestors: { $all: [ req.body._id ] } }
		]}, function(err, docs) {
			if(err) throw err;
			var toRemove = [];
			for(var i = 0; i < docs.length; i++) {
				toRemove.push(docs[i]._id);
			}
			directories.remove({ _id: { $in: toRemove } });
			return res.send({ status: 0 });
		}
	);
});

app.post('/api/renameDir', function(req, res) {
	if(!req.body._id || !req.body.name) return res.send({ status: 1 });
	var directories = req.db.get('directories');
	directories.findById(req.body._id, function(err, doc) {
		if(err) throw err;
		doc.name = req.body.name;
		directories.update({ _id: doc._id }, doc, function() {
			return res.send({ status: 0 });
		});
	});
});
/*
app.get('/*', function(req, res) {
	res.redirect('/');
});
*/
var server = app.listen(3000, function() {
	var host = server.address().address
		, port = server.address().port;
	console.log('Magic happens on http://%s:%s', host, port);
});
