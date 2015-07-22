var api = (function() {
	var ajax = function(options) {
		var method = options.method || 'GET'
			, url = options.url || null
			, success = options.success
			, error = options.error
			, data = options.data || {}
			;

		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if(request.readyState == 4) {
			 if(request.status == 200) success && success(JSON.parse(request.response));
			 else error && error(request.response);
			}
		};
		request.open(method, url, true);
		request.send(data);
	};

	return {
		ajax: ajax
	};
})();