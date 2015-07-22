define('drive'
	, [ 'underscore', 'api' ]
	, function() {
		"use strict";
		_.templateSettings = {
		  interpolate: /\{\{(.+?)\}\}/g
		};

		var DOMElements = {
			showItems: document.querySelector('.drive-show-items')
		};

		window.layouts = {
			listItem: [ '<div class="tr tr-b"><span class="ti ti-8"><a href="{{url || "#"+ id}}"{{url ? " target=\'_blank\'" : ""}}'
				, ' class="ti-content">{{type == "folder" ? layouts.iconFolder : layouts.iconFile }} {{name}}</a></span>'
				, '<span class="ti ti-4"><span class="ti-content">{{size}}</span></span></div>' ].join('')
			, iconFolder: '<i class="material-icons md-18">folder</i>'
			, iconFile: '<i class="material-icons md-18">description</i>'
		};

		var drive = (function() {
			var currentDirectory = '';

			var setDirectory = function() {
				currentDirectory = window.location.hash.split('#')[1] || '';
				list();
			};

			var routes = {
				getItems: { method: 'GET', url: '/api/items/' }
			};

			var list = function() {
				api.ajax({
					method: routes.getItems.method
					, url: routes.getItems.url + currentDirectory
					, success: function(data) {
						var html = '';
						for(var item in data) html += _.template(layouts.listItem)(data[item]);
						DOMElements.showItems.innerHTML = html;
					}
					, error: function(data) {
						return new Error(data);
					}
				});
			};

			return {
				setDirectory: setDirectory
				, list: list
			};
		})();

		drive.setDirectory();

		window.addEventListener('hashchange', drive.setDirectory);
	}
);