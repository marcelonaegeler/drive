var api = (function() {
	var getEncode = function(obj) {
		var str = '?';
		for(var el in obj) str += [ el, '=', obj[el], '&' ].join('');
		return str.slice(0, str.length-1);
	};

	var postEncode = function(obj) {
		var str = '';
		for(var el in obj) str += [ el, '=', obj[el], '&' ].join('');
		return str.slice(0, str.length-1);
	};

	var ajax = function(options) {
		var method = options.method || 'GET'
			, url = options.url || null
			, success = options.success
			, error = options.error
			, data = options.data || {}
			, setPostHeader = false
			;

		if(method == 'GET') {
			if(typeof data == 'object') {
				url += getEncode(data);
			} else {
				url += data;
				data = null;
			}
		} else if(method == 'POST') {
			data = postEncode(data);
			setPostHeader = true;
		}

		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if(request.readyState == 4) {
			 if(request.status == 200) success && success(JSON.parse(request.response));
			 else error && error(request.response);
			}
		};
		request.open(method, url, true);
		setPostHeader && request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		request.send(data);
	};

	return {
		ajax: ajax
	};
})();