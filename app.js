var express = require('express')
	, app = express()
	, swig = require('swig')
	, bodyParser = require('body-parser')
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

// Routes
app.get('/', function(req, res) {
	res.render('index', { title: 'Drive' });
});

app.get('/api/items/?(:id)?', function(req, res) {
	if(!req.params.id) {
		currentDirectory = { name: 'My drive', parent: null };
		var data = [
			{ id: 123456, name: 'Folder 01', parent: null, type: 'folder', size: null, url: null }
			, { id: 234567, name: 'Folder 02', parent: null, type: 'folder', size: null, url: null }
			, { id: 345678, name: 'File 01', parent: null, type: 'file', size: '350Kb', url: 'http://sou.digital' }
		];
	} else if(req.params.id == '123456') {
		currentDirectory = { name: 'My drive', parent: 'root' };
		var data = [
			{ id: 345678, name: 'Folder 01', parent: req.params.id, type: 'folder', size: null, url: null }
			, { id: 456789, name: 'File 01', parent: req.params.id, type: 'file', size: '350Kb', url: 'http://sou.digital' }
		];
	} else if(req.params.id == '345678') {
		currentDirectory = { name: 'My drive', parent: 123456 };
		var data = [
			{ id: 345678, name: 'Folder 01-02', parent: 345678, type: 'folder', size: null, url: null }
			, { id: 456789, name: 'File 01', parent: 345678, type: 'file', size: '350Kb', url: 'http://sou.digital' }
		];
	}

	return res.send({ items: data, currentDirectory: currentDirectory });
});

app.post('/api/mkdir', function(req, res) {
	console.log(req.body, req.params);
	return res.send({ success: 'ok' });
});

app.get('/*', function(req, res) {
	res.redirect('/');
});

var server = app.listen(3001, function() {
	var host = server.address().address
		, port = server.address().port;
	console.log('Drive app listening at http://%s:%s', host, port);
});