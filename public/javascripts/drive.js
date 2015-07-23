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
			, notify: document.querySelector('.drive-notify')
		};

		window.layouts = {
			listItem: [ '<div class="tr tr-b"><span class="ti ti-8"><a href="{{url || "#"+ id}}"{{url ? " target=\'_blank\'" : ""}}'
				, ' class="ti-content">{{type == "folder" ? layouts.iconFolder : layouts.iconFile }} {{name}}</a></span>'
				, '<span class="ti ti-4"><span class="ti-content">{{size}}</span></span></div>' ].join('')
			, emptyList: '<div class="tr tr-b"><span class="ti ti-12"><span class="ti-content">Não há nada aqui :(</span></span></div>'
			, iconFolder: '<i class="material-icons md-18">folder</i>'
			, iconFile: '<i class="material-icons md-18">description</i>'
			, mkdir: [ '<span class="ti ti-8"><span class="ti-content">'
				, '{{layouts.iconFolder}} <input type="text" name="newFolder" class="tr-input" placeholder="New folder" /></span></span>'
				, '<span class="ti ti-4"></span>' ].join('')
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
						var html = ''
							, items = data.items;
						setDirectoryInfo(data.currentDirectory);
						
						for(var item in items) html += _.template(layouts.listItem)(items[item]);
						if(!items.length) html += layouts.emptyList;
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
						, parent: currentDirectoryInfo.id
					}
					, success: function(data) {
						console.log(data);
						list();
						showNotification('Directory created sucessfully!');
					}
					, error: function(data) {
						return new Error(data);
					}
				});
			};

			var showNotification = function(text) {
				DOMElements.notify.querySelector('.drive-notify-text').innerHTML = text;
				DOMElements.notify.classList.add('open');

				setTimeout(closeNotification, 3000);
			};

			var closeNotification = function() {
				DOMElements.notify.classList.remove('open');
				DOMElements.notify.querySelector('.drive-notify-text').innerHTML = '';
			};

			return {
				setDirectory: setDirectory
				, list: list
				, mkdir: mkdir
				, closeNotification: closeNotification
			};
		})();

		drive.setDirectory();

		window.addEventListener('hashchange', drive.setDirectory);

		window.mkdir = function() {
			var html = _.template(layouts.mkdir)({});
			var wrap = document.createElement('div');
			wrap.classList.add('tr', 'tr-b');
			wrap.innerHTML = html;
			DOMElements.showItems.insertBefore(wrap, DOMElements.showItems.firstChild);
			
			var input = wrap.querySelector('input')
				, createDir = true;
			input.focus();
			input.addEventListener('focusout', function(event) {
				if(createDir) this.value && drive.mkdir(this.value);
				createDir = true;
			});

			input.addEventListener('keydown', function(event) {
				if(event.keyCode == 13) { // Enter
					this.value && document.getElementById('focusOutTrigger').focus();
					return false;
				} else if(event.keyCode == 27) { // ESC
					createDir = false;
					wrap.remove();
				} else {
					console.log(event.keyCode);
					return false;
				}
			});
		};


		/*
		* Elements EventListeners
		*/
		DOMElements.notify.querySelector('.drive-notify-close').onclick = function() {
			drive.closeNotification();
		};
	}
);