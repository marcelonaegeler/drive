var express = require('express')
	, app = express()
	, swig = require('swig')
	, bodyParser = require('body-parser')
	, mongo = require('mongodb')
	, db = require('monk')('localhost:27017/drive')
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
		, data = [];

	if(!req.params.id) {
		currentDirectory = { id: null, name: 'My drive', parent: null };
		var data = [
			{ id: 123456, name: 'Folder 01', parent: null, type: 'folder', size: null, url: null }
			, { id: 234567, name: 'Folder 02', parent: null, type: 'folder', size: null, url: null }
			, { id: 345678, name: 'File 01', parent: null, type: 'file', size: '350Kb', url: 'http://sou.digital' }
		];
	} else if(req.params.id == '123456') {
		currentDirectory = { id: '123456', name: 'Folder 01', parent: 'root' };
		var data = [
			{ id: 345678, name: 'Folder 01', parent: req.params.id, type: 'folder', size: null, url: null }
			, { id: 456789, name: 'File 01', parent: req.params.id, type: 'file', size: '350Kb', url: 'http://sou.digital' }
		];
	} else if(req.params.id == '345678') {
		currentDirectory = { id: '345678', name: 'My drive', parent: '123456' };
		var data = [
			{ id: 345678, name: 'Folder 01-02', parent: 345678, type: 'folder', size: null, url: null }
			, { id: 456789, name: 'File 01', parent: 345678, type: 'file', size: '350Kb', url: 'http://sou.digital' }
		];
	} else {
		currentDirectory = { id: '234567', name: 'My drive', parent: 'root' };
	}

	var directories = db.get('directories');
	directories.find({}, function(err, docs) {
		if(err) throw err;
		data.directories = docs;
	});

	function response() {
		return res.send(data);
	}
});

app.post('/api/mkdir', function(req, res) {
	var directories = db.get('directories');
	directories.insert({ name: req.body.name, parent: req.body.parent }, function(err, docs) {
		if(err) throw err;
		console.log(err, docs);
		return res.send(req.body);
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