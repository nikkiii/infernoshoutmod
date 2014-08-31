define(['text!./settings/settings.html', './settings/frontend'], function(settingsHtml, settingsJs) {
	var settingsParsers = {
		'checkbox' : function($elem) {
			return $elem.is(':checked') ? true : false;
		},
		'pluginlist' : function($elem) {
			var urls = [];
			$elem.children('li').each(function(index) {
				urls.push($(this).data('url'));
			});
			return urls;
		}
	};

	var valuePopulators = {
		'checkbox' : function($elem, value) {
			$elem.prop('checked', value ? true : false);
		},
		'pluginlist' : function($elem, value) {
			var i;
			for (i = 0; i < value.length; i++) {
				var $li = $('<li />');
				$li.html(value[i].substring(value[i].lastIndexOf('/')+1) + ' <a id="infernoshoutmod-plugin-remove" href="#"><i class="fa fa-times"></i></a>');
				$li.data('url', value[i]);
				$li.appendTo($elem);
			}
		}
	};

	var InfernoShoutModDbLoad = function(mod, db) {
		var settings = db.transaction(['settings'], 'readonly');

		var store = settings.objectStore('settings');

		var ParseSetting = function(id, info, $elem) {
			var transaction = db.transaction(['settings'], 'readwrite');

			var store = transaction.objectStore('settings');

			var value = settingsParsers[info.type]($elem);

			var req = store.put({ 'setting' : id, 'value' : value});

			req.onsuccess = function(e) {
				info.callback(value);
			};
		};

		var LoadSetting = function(id, setting) {
			var $elem = $('#infernoshoutmod-setting-' + id);

			var get = store.get(id);

			get.onsuccess = function(e) {
				var result = e.target.result

				if (result) {
					valuePopulators[setting.type]($elem, result.value);

					setting.callback(result.value);
				}

				$elem.change(function() {
					ParseSetting(id, setting, $(this));
				});
			};

			get.onerror = function(e) {
				$elem.change(function() {
					ParseSetting(id, setting, $(this));
				});
			};
		};

		for (var id in mod.settings) {
			LoadSetting(id, mod.settings[id]);
		}
	};

	var InfernoShoutModSettings = function(mod) {
		if (!("indexedDB" in window)) {
			console.log('No IndexedDB support, settings disabled.');
			return;
		}

		mod.addStaticTab('settings', 'InfernoShoutMod', settingsHtml);
		settingsJs.init();

		var open = indexedDB.open('infernoshoutmod', 1);

		open.onupgradeneeded = function(e) {
			var db = e.target.result;

			if(!db.objectStoreNames.contains("settings")) {
				db.createObjectStore("settings", { keyPath : 'setting' });
			}
		};

		open.onsuccess = function(e) {
			InfernoShoutModDbLoad(mod, e.target.result);
		};

		open.onerror = function(e) {
			console.log('[InfernoShoutMod] Unable to open settings db.');
		};

		mod.addSetting = function(id, type, callback) {
			this.settings || (this.settings = {});

			this.settings[id] = { 'type' : type, 'callback' : callback };
		};

		InfernoShoutbox.initialIdleTimeLimit = InfernoShoutbox.idletimelimit;

		mod.addSetting('idle', 'checkbox', function(val) {
			InfernoShoutbox.idletimelimit = val ? InfernoShoutbox.initialIdleTimeLimit : 2147483647;
		});

		mod.addSetting('effects', 'checkbox', function(val) {
			InfernoShoutbox.effects = val;
		});

		mod.addSetting('plugins', 'pluginlist', function(val) {
			var load = [];
			for (var i = 0; i < val.length; i++) {
				if (!(val[i] in mod.plugins)) {
					load.push(val[i]);
				}
			}
			require(load, function() {
				var i;
				var list = [];
				for(i = 0; i < arguments.length; i++) {
					arguments[i].init(mod);
					mod.plugins.push(val[i]);
				}
			});
		});
	};

	return {
		init : InfernoShoutModSettings
	};
});