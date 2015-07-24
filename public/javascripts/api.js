var api = (function() {

	var arrayPop = function(arr, index) {
		var aux = []
			, count = arr.length
			, auxIndex = 0;
		for(var i = 0; i < count; i++) {
			if(i == index) continue;
			aux[auxIndex] = arr[i];
			auxIndex++;
		}
		return aux;
	};

	var generateId = function() {
		return '_' + Math.random().toString(36).substr(2, 9);
	};

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
			, progress = options.progress
			, data = options.data || {}
			, setPostHeader = false
			;

		if(method == 'GET') {
			if(typeof data == 'object')
				url += getEncode(data);
			else {
				url += data;
				data = null;
			}
		} else if(method == 'POST' && !(data instanceof FormData)) {
			data = postEncode(data);
			setPostHeader = true;
		}

		var request = new XMLHttpRequest();
		// Set the progress
		if(progress) request.onprogress = progress;
		// Ready state change
		request.onreadystatechange = function() {
			if(request.readyState == 4) {
			 if(request.status == 200) success && success(JSON.parse(request.response));
			 else error && error(request.response);
			}
		};
		request.open(method, url, true);
		// Set header for POST
		setPostHeader && request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		request.send(data);
	};

	return {
		ajax: ajax
		, arrayPop: arrayPop
		, generateId: generateId
	};
})();