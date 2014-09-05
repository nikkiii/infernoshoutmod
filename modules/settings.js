define(['./mod', 'text!./settings/settings.html', './settings/frontend'], function(InfernoShoutMod, settingsHtml, settingsJs) {
	var valParser = function($elem) {
		return $elem.val();
	};

	var settingsParsers = {
		'checkbox': function($elem) {
			return $elem.is(':checked') ? true : false;
		},
		'number' : function($elem) {
			return parseInt($elem.val());
		}
	};

	var valPopulator = function($elem, value) {
		$elem.val(value);
	};

	var valuePopulators = {
		'checkbox': function($elem, value) {
			$elem.prop('checked', value ? true : false);
		}
	};

	InfernoShoutMod.prototype.addSetting = function(id, type, callback) {
		this.settings || (this.settings = {});

		this.settings[id] = { 'type': type, 'callback': callback };
	};

	var InfernoShoutModDbLoad = function(mod, db) {
		var ParseSetting = function(id, info, $elem) {
			var transaction = db.transaction(['settings'], 'readwrite');

			var store = transaction.objectStore('settings');

			var parser = false;

			if (info.type in settingsParsers) {
				parser = settingsParsers[info.type];
			} else if (typeof(info.type) == 'object' && 'parser' in info.type) {
				parser = info.type.parser;
			} else {
				parser = valParser;
			}

			if (parser === false) {
				return;
			}

			var value = parser($elem);

			var req = store.put({ 'setting': id, 'value': value});

			req.onsuccess = function(e) {
				info.callback(value);
			};
		};

		var LoadSetting = function(id, setting) {
			var $elem = $('#infernoshoutmod-setting-' + id);

			var settings = db.transaction(['settings'], 'readonly');

			var store = settings.objectStore('settings');

			var get = store.get(id);

			get.onsuccess = function(e) {
				var result = e.target.result

				if (result) {
					var populator = false;

					if (setting.type in valuePopulators) {
						populator = valuePopulators[setting.type];
					} else if (typeof(setting.type) == 'object' && 'populator' in setting.type) {
						populator = setting.type.populator;
					} else {
						populator = valPopulator;
					}

					if (populator === false) {
						return;
					}

					populator($elem, result.value);

					setting.callback(result.value);
				}

				// We can also trigger this via .trigger('change'), so it's the best universal method
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

		var initializedSettings = [];

		for (var id in mod.settings) {
			LoadSetting(id, mod.settings[id]);
			initializedSettings.push(id);
		}

		// Hook plugins loading so we can initialize their settings
		mod.on('pluginLoad', function(plugin) {
			for (var id in mod.settings) {
				if (initializedSettings.indexOf(id) == -1) {
					LoadSetting(id, mod.settings[id]);
					initializedSettings.push(id);
				}
			}
		});
	};

	var SettingsModuleInit = function(mod) {
		if (!("indexedDB" in window)) {
			console.log('No IndexedDB support, settings disabled.');
			return;
		}

		mod.addStaticTab('settings', 'InfernoShoutMod', settingsHtml);
		settingsJs.init(mod);

		var open = indexedDB.open('infernoshoutmod', 1);

		open.onupgradeneeded = function(e) {
			var db = e.target.result;

			if (!db.objectStoreNames.contains("settings")) {
				db.createObjectStore("settings", { keyPath: 'setting' });
			}
		};

		open.onsuccess = function(e) {
			InfernoShoutModDbLoad(mod, e.target.result);
		};

		open.onerror = function(e) {
			console.log('[InfernoShoutMod] Unable to open settings db.');
		};

		InfernoShoutbox.initialIdleTimeLimit = InfernoShoutbox.idletimelimit;

		mod.addSetting('idle', 'checkbox', function(val) {
			InfernoShoutbox.idletimelimit = val ? InfernoShoutbox.initialIdleTimeLimit : 2147483647;
		});
	};

	return {
		init: SettingsModuleInit
	};
});