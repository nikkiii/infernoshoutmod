define(function() {
	var CustomPluginLoader = function(mod) {
		var populator = function($elem, value) {
			var i;
			for (i = 0; i < value.length; i++) {
				var $li = $('<li />');
				$li.html(value[i].substring(value[i].lastIndexOf('/') + 1) + ' <a id="infernoshoutmod-plugin-remove" href="#"><i class="fa fa-times"></i></a>');
				$li.data('url', value[i]);
				$li.appendTo($elem);
			}
		};

		var parser = function($elem) {
			var urls = [];
			$elem.children('li').each(function(index) {
				urls.push($(this).data('url'));
			});
			return urls;
		};

		mod.addSetting('plugins', { populator : populator, parser : parser }, function(val) {
			var load = [];
			for (var i = 0; i < val.length; i++) {
				if (!(val[i] in mod.plugins)) {
					load.push(val[i]);
				}
			}
			require(load, function() {
				if (arguments.length < 1) {
					return;
				}
				var i;
				for (i = 0; i < arguments.length; i++) {
					var plugin = arguments[i];

					arguments[i].init(mod);

					if (typeof plugin['id'] !== undefined) {
						mod.onPluginLoad(plugin['id']);
					} else {
						mod.onPluginLoad(val[i]);
					}
				}
			});
		});
	};

	return {
		id : 'customloader',
		init : CustomPluginLoader
	};
});