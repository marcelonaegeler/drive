var express = require('express')
	, app = express()
	, swig = require('swig')
	;

// Configs

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname +'/views');
app.use(express.static(__dirname +'/public'));
app.set('view cache', false);
swig.setDefaults({ cache: false });

// Routes
app.get('/', function(req, res) {
	res.render('index', { title: 'Drive' });
});

app.get('/api/items/?(:id)?', function(req, res) {
	if(!req.params.id) {
		var data = [
			{ id: 123456, name: 'Folder 01', parent: null, type: 'folder', size: null, url: null }
			, { id: 234567, name: 'Folder 02', parent: null, type: 'folder', size: null, url: null }
			, { id: 345678, name: 'File 01', parent: null, type: 'file', size: '350Kb', url: 'http://sou.digital' }
		];
	} else {
		var data = [
			{ id: 123456, name: 'Folder 01', parent: req.params.id, type: 'folder', size: null, url: null }
			, { id: 345678, name: 'File 01', parent: req.params.id, type: 'file', size: '350Kb', url: 'http://sou.digital' }
		];
	}

	return res.send(data);
});

var server = app.listen(3001, function() {
	var host = server.address().address
		, port = server.address().port;
	console.log('Drive app listening at http://%s:%s', host, port);
});