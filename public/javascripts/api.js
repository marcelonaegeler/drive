var api = (function() {
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
				var dataStr = '?';
				for(var el in data) dataStr += [ el, '=', data[el], '&' ].join('');
				url += dataStr.slice(0, dataStr.length-1);
			} else {
				url += data;
				data = null;
			}
		} else if(method == 'POST') {
			var formData = new FormData();
			for(var i in data) formData.append(i, data[i]);
			data = JSON.stringify(formData);
		}

		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if(request.readyState == 4) {
			 if(request.status == 200) success && success(JSON.parse(request.response));
			 else error && error(request.response);
			}
		};
		request.open(method, url, true);
		setPostHeader && request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send(data);
	};

	return {
		ajax: ajax
	};
})();