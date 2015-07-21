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

app.get('/api/items/?(:id)', function(req, res) {
	console.log(req.params, req.param('id'));
});

var server = app.listen(3001, function() {
	var host = server.address().address
		, port = server.address().port;
	console.log('Drive app listening at http://%s:%s', host, port);
});