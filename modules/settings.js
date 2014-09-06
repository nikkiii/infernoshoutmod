define(['./mod', 'idb', 'text!./settings/settings.html', './settings/frontend'], function(InfernoShoutMod, idb, settingsHtml, settingsJs) {
	var valParser = function($elem) {
		return $elem.val();
	};

	var settingsParsers = {
		'checkbox': function($elem) {
			return $elem.is(':checked') ? true : false;
		},
		'number': function($elem) {
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

	InfernoShoutMod.prototype.addSetting = function(id, type, html, callback) {
		this.settings || (this.settings = {});

		if ($.isFunction(html)) {
			callback = html;
		} else {
			$('#infernoshoutmod_tab_content_settings > #content_box').append(arg3);
		}

		this.settings[id] = { 'type': type, 'callback': callback };
	};

	var InfernoShoutModDbLoad = function(mod, db) {
		var ParseSetting = function(id, info, $elem) {
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

			var store = db.store('settings');

			store.put({ 'setting': id, 'value': value}, function(err, res) {
				info.callback(value);
			});
		};

		var LoadSetting = function(id, setting) {
			var $elem = $('#infernoshoutmod-setting-' + id);

			var store = db.store('settings');

			store.get(id, function(err, res) {
				if (res) {
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

					populator($elem, res.value);

					setting.callback(res.value);
				}

				// We can also trigger this via .trigger('change'), so it's the best universal method
				$elem.change(function() {
					ParseSetting(id, setting, $(this));
				});
			});
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

		idb.open('infernoshoutmod', 1, {
			upgrade : function(db) {
				if (!db.objectStoreNames.contains("settings")) {
					db.createObjectStore("settings", { keyPath: 'setting' });
				}
			},
			success : function(db) {
				InfernoShoutModDbLoad(mod, db);
			},
			error : function(error) {
				console.log('[InfernoShoutMod] Unable to open settings db.');
			}
		});

		InfernoShoutbox.initialIdleTimeLimit = InfernoShoutbox.idletimelimit;

		mod.addSetting('idle', 'checkbox', function(val) {
			InfernoShoutbox.idletimelimit = val ? InfernoShoutbox.initialIdleTimeLimit : 2147483647;
		});
	};

	return {
		init: SettingsModuleInit
	};
});