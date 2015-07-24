var express = require('express')
	, app = express()
	, swig = require('swig')
	, bodyParser = require('body-parser')
	, mongo = require('mongodb')
	, db = require('monk')('localhost:27017/drive')
	, _ = require('underscore')
	, multiparty = require('multiparty')
	;

// Configs
swig.setDefaults({ cache: false });
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname +'/views');
app.set('view cache', false);
app.use(express.static(__dirname +'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Pass the DB connection to the routes
app.use(function(req, res, next){
  req.db = db;
  next();
});

// Routes
app.get('/', function(req, res) {
	res.render('index', { title: 'Drive' });
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

app.get('/*', function(req, res) {
	res.redirect('/');
});

var server = app.listen(3001, function() {
	var host = server.address().address
		, port = server.address().port;
	console.log('Drive app listening at http://%s:%s', host, port);
});