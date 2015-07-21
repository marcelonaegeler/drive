(function() {
	"use strict";
	var checks = document.querySelectorAll('.icon-check');

	var api = (function() {
		var setLabel = function(event) {
			var check = event.target;
			check.checked ? check.parentNode.classList.add('checked') : check.parentNode.classList.remove('checked');
			drive.list();
		};

		var parseHtml = function(str, data) {
			for(var i in data) str = str.replace(new RegExp('{'+ i +'}', 'g'), data[i]);
			return str;
		};

		return {
			setLabel: setLabel
			, parseHtml: parseHtml
		};
	})();


	var drive = (function() {
		var list = function() {
			var request = new XMLHTTPRequest();
			request.open('GET', '/api/items/', true);
			request.send(null);
		};

		return {
			list: list
		};
	})();

	

	var checksLength = checks.length
		, i = 0;
	while(i < checksLength) {
		checks[i].addEventListener('change', api.setLabel);
		i++;
	}
})();