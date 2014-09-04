define(function() {
	var NoShadowPlugin = function(mod) {
		var enableEffects = true;

		mod.addSetting('effects', 'checkbox', function(val) {
			enableEffects = val;
		});

		mod.on('update_shouts', function(shouts) {
			if (!enableEffects) {
				$('span', InfernoShoutbox.shoutframe).each(function(index) {
					if ($(this).css('text-shadow')) {
						$(this).css('text-shadow', '');
					}
				});
			}
		});
	};

	return {
		init: NoShadowPlugin
	};
});