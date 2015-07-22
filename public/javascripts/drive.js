define('drive'
	, [ 'underscore', 'api' ]
	, function() {
		"use strict";
		_.templateSettings = {
		  interpolate: /\{\{(.+?)\}\}/g
		};

		var DOMElements = {
			showItems: document.querySelector('.drive-show-items')
			, backButton: document.querySelector('.drive-action-back')
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
			var currentDirectoryInfo = {};

			var setDirectory = function() {
				currentDirectory = window.location.hash.split('#')[1] || '';
				list();
			};

			var setDirectoryInfo = function(newData) {
				currentDirectoryInfo = newData;

				if(!currentDirectoryInfo.parent)
					DOMElements.backButton.style.display = 'none';
				else {
					DOMElements.backButton.style.display = '';
					DOMElements.backButton.href = "#"+ (currentDirectoryInfo.parent != 'root' ? currentDirectoryInfo.parent : '');
				}
			};

			var routes = {
				getItems: { method: 'GET', url: '/api/items/' }
				, mkdir: { method: 'POST', url: '/api/mkdir' }
			};

			var list = function() {
				api.ajax({
					method: routes.getItems.method
					, url: routes.getItems.url + currentDirectory
					, success: function(data) {
						var html = '';
						var items = data.items;
						setDirectoryInfo(data.currentDirectory);
						
						for(var item in items) html += _.template(layouts.listItem)(items[item]);
						DOMElements.showItems.innerHTML = html;
					}
					, error: function(data) {
						return new Error(data);
					}
				});
			};

			var mkdir = function(name) {

				api.ajax({
					method: routes.mkdir.method
					, url: routes.mkdir.url
					, data: {
						name: name
						, parent: currentDirectoryInfo.parent
					}
					, success: function(data) {
						console.log(data);
					}
					, error: function(data) {
						return new Error(data);
					}
				});
			};

			return {
				setDirectory: setDirectory
				, list: list
				, mkdir: mkdir
			};
		})();

		drive.setDirectory();

		window.addEventListener('hashchange', drive.setDirectory);

		window.mkdir = function() {
			var name = prompt('Insert the name:');
			drive.mkdir(name);
		};
	}
);