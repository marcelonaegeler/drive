/* globals api */
define('drive'
	, [ 'underscore', 'api' ]
	, function() {
		"use strict";
		_.templateSettings = {
		  interpolate: /\{\{(.+?)\}\}/g
		};

		var defaultDirectoryInfo = {
			name: 'Drive'
		};

		var uploadInfo = {
			uploads: []
			, errors: []
			, running: false
			, uploading: null
		};

		var DOMElements = {
			showItems: document.querySelector('.drive-show-items')
			, backButton: document.querySelector('.drive-action-back')
			, notify: document.querySelector('.drive-notify')
			, inputUpload: document.querySelector('.drive-input-upload')
			, uploadHead: document.querySelector('.upload-list-head')
			, uploadList: document.querySelector('.drive-upload-list')
			, errorList: document.querySelector('.drive-error-list')
			, breadcrumb: document.querySelector('.breadcrumb')
		};

		var layouts = {
			listFolder: [ '<div class="tr tr-b"><span class="ti ti-8"><a href="{{"#"+ _id}}"'
				, ' class="ti-content">{{layouts.iconFolder}} {{name}}</a></span>'
				, '<span class="ti ti-4"><span class="ti-content">'
				, '<span class="list-options">{{ layouts.listActions(_id) }}</span></span>'
				, '</div>' ].join('')

			, listFile: [ '<div class="tr tr-b"><span class="ti ti-8">'
				, '<a href="{{url || "javascript:void(0);"}}"{{url ? " target=\'_blank\'" : ""}}'
				, ' class="ti-content">{{ layouts.iconFile }} {{name}}</a></span>'
				, '<span class="ti ti-4"><span class="ti-content">'
				, '<span class="list-options">{{ layouts.listActions(_id) }}</span></span>'
				, '</div>' ].join('')

			, emptyList: [ '<div class="tr tr-b"><span class="ti ti-12"><span class="ti-content">'
				, 'Não há nada aqui :(</span></span></div>' ].join('')

			, breadcrumbLink: '<a href="#{{_id}}">{{name}}</a>'
			, iconFolder: '<i class="material-icons md-18">folder</i>'
			, iconFile: '<i class="material-icons md-18">description</i>'
			, mkdir: [ '<span class="ti ti-8"><span class="ti-content">'
				, '{{layouts.iconFolder}} <input type="text" name="newFolder" class="tr-input" placeholder="New folder" /></span></span>'
				, '<span class="ti ti-4"></span>' ].join('')
			, uploadItem: [ '<div class="drive-upload-item clearfix" id="{{id}}"><span class="upload-item-name left">{{file.name}}</span>'
				,'<span class="drive-progress right"><span class="drive-progress-text">Waiting...</span>'
				, '<span class="drive-progress-bar"></span></span></div>' ].join('')
			, uploadItemFail: '<a href="javascript:retryUpload({{id}})">Try again</a>'
			, uploadItemSuccess: '<span>Sucesso</span>'
			, uploadItemProcessing: '<span>Processando</span>'
			, listActions: function(_id) {
				return [
					'<a href="javascript:renameDir(\'', _id, '\')" class="btn btn-small btn-list"><i class="material-icons md-16">edit</i> Rename</a>'
					, '<a href="javascript:rmdir(\'', _id, '\')" class="btn btn-small btn-list"><i class="material-icons md-16">delete</i> Delete</a>'
				].join('');
			}
		};

		window.layouts = layouts;

		var drive = (function() {
			var currentDirectory = '';
			var currentDirectoryInfo = {};

			var setDirectory = function() {
				currentDirectory = window.location.hash.split('#')[1] || '';
				list();
			};

			var setDirectoryInfo = function(newData) {
				currentDirectoryInfo = newData;
				console.log(currentDirectoryInfo);

				if(currentDirectoryInfo) {
					if(currentDirectoryInfo.name) document.title = currentDirectoryInfo.name;

					DOMElements.backButton.style.display = '';
					DOMElements.backButton.href = "#"+ (currentDirectoryInfo.parent ? currentDirectoryInfo.parent : '');

					var breadcrumbs = [];
					//for()
				} else {
					DOMElements.backButton.style.display = 'none';
					document.title = defaultDirectoryInfo.name;
				}
			};

			var routes = {
				getItems: { method: 'GET', url: '/api/items' }
				, mkdir: { method: 'POST', url: '/api/mkdir' }
				, upload: { method: 'POST', url: '/api/upload' }
				, rmdir: { method: 'POST', url: '/api/rmdir' }
				, renameDir: { method: 'POST', url: '/api/renameDir' }
			};

			var list = function() {
				api.ajax({
					method: routes.getItems.method
					, url: [ routes.getItems.url, currentDirectory ].join('/')
					, success: function(data) {
						var html = ''
							, dirs = data.directories
							, files = data.files
							;
						setDirectoryInfo(data.currentDirectory);

						for(var item in dirs) html += _.template(layouts.listFolder)(dirs[item]);
						for(var item in files) html += _.template(layouts.listFolder)(files[item]);
						if(!dirs.length && !files.length) html += layouts.emptyList;
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
						, parent: currentDirectoryInfo._id
					}
					, success: function() {
						list();
						showNotification('Directory created sucessfully!');
					}
					, error: function(data) {
						return new Error(data);
					}
				});
			};

			var prepareUpload = function(event) {
				showNotification('Preparing upload...');

				var files = event.target.files ? event.target.files : event.dataTransfer.files
					, filesLength = files.length
					, html = '';

				for(var el = 0; el < filesLength; el++) {
					var file = {
						id: api.generateId()
						, parent: currentDirectoryInfo.root ? 'root' : currentDirectoryInfo._id
						, file: files[el]
					};
					uploadInfo.uploads.push(file);
					html += _.template(layouts.uploadItem)(file);
				}

				var toAppend = document.createElement('div');
				toAppend.innerHTML = html;
				DOMElements.uploadList.appendChild(toAppend);

				!uploadInfo.running && upload();
			};

			var upload = function() {
				if(!uploadInfo.uploads.length) {
					uploadInfo.running = false;
					showNotification('Upload successfull!');
					return false;
				}
				uploadInfo.running = true;
				showNotification('Uploading...');

				var file = uploadInfo.uploads[0];
				var formData = new FormData();
				formData.append('file', file.file);
				formData.append('parent', file.parent);

				var listItem = document.getElementById(file.id)
					, bar = listItem.querySelector('.drive-progress-bar')
					, text = listItem.querySelector('.drive-progress-text')
					;

				api.ajax({
					url: routes.upload.url
					, method: routes.upload.method
					, data: formData
					, progress: function(event) {
						var percent = Math.ceil((event.loaded / event.total) * 100);
						bar.style.width = percent +'%';
						text.innerHTML = percent +'%';
						if(percent == 100) {
							bar.classList.add('warning');
							text.innerHTML = layouts.uploadItemProcessing;
						}
					}
					, success: function(data) {
						uploadInfo.uploads = api.arrayPop(uploadInfo.uploads, 0);
						bar.classList.add('success');
						text.innerHTML = layouts.uploadItemSuccess;
						return upload();
					}
					, error: function(data) { console.log(data); }
				});
			};

			var rmdir = function(id) {
				api.ajax({
					url: routes.rmdir.url
					, method: routes.rmdir.method
					, data: { _id: id }
					, success: function() {
						list();
					}
					, error: function() {
						alert('Erro ao excluir.');
					}
				});
			};

			var renameDir = function(id, name) {
				api.ajax({
					url: routes.renameDir.url
					, method: routes.renameDir.method
					, data: { _id: id, name: name }
					, success: function(data) {
						if(!data.status) return list();
						else alert('Erro ao renomear.');
					}
					, error: function() {
						alert('Erro ao renomear.');
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
				, rmdir: rmdir
				, renameDir: renameDir
				, prepareUpload: prepareUpload
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
			input.addEventListener('blur', function() {
				if(createDir) this.value && drive.mkdir(this.value);
				createDir = true;
			});

			input.addEventListener('keydown', function(event) {
				if(event.keyCode == 13) { // Enter
					this.value && document.getElementById('focus-out-trigger').focus();
					return false;
				} else if(event.keyCode == 27) { // ESC
					createDir = false;
					wrap.remove();
				}
			});
		};

		window.upload = function() {
			var click = new Event('click');
			DOMElements.inputUpload.dispatchEvent(click);
		};
		window.renameDir = function(id) {
			var newName = prompt('Novo nome para o diretório: ');
			if(!id || !newName) return;
			drive.renameDir(id, newName);
		};
		window.rmdir = function(id) {
			if(!id || !confirm('Deseja mesmo excluir este item?')) return false;
			drive.rmdir(id);
		};

		/*
		* Elements EventListeners
		*/
		DOMElements.notify.querySelector('.drive-notify-close').onclick = function() {
			drive.closeNotification();
		};
		DOMElements.inputUpload.onchange = drive.prepareUpload;

		DOMElements.uploadHead.onclick = function(event) {
			event.preventDefault();
			DOMElements.uploadList.parentNode.classList.toggle('open');
		};

	}
);
