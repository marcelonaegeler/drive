var config = {paths: {}, shim: {}};

config.paths = {
	underscore: '../../vendor/underscore/underscore-min'
};

// Set config
require.config(config);

// Get the required modules from body's 'data-require'
var modules = document.getElementById('main').getAttribute('data-require').split(',');
var requireModules = [];
for(var module in modules) {
	requireModules.push(modules[module].trim());
}

require(requireModules);
