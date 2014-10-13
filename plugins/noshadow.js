define(function() {
	var NoShadowPlugin = function(mod) {
		var enableEffects = true;

		mod.addSetting('effects', 'checkbox', function(val) {
			enableEffects = val;
		});

		mod.on('update_shouts_post', function(ctx) {
			if (!enableEffects) {
				$('span', InfernoShoutbox.shoutframe).filter(function() {
					return typeof this.style['text-shadow'] !== "undefined";
				}).each(function(index) {
					$(this).css('text-shadow', '');
				});
			}
		});
	};

	return {
		id : 'noeffects',
		init: NoShadowPlugin
	};
});