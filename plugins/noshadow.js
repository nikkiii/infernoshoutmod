define(function () {
	var NoShadowPlugin = function (mod) {
		mod.on('update_shouts', function (shouts) {
			if (!InfernoShoutbox.effects) {
				$('span', InfernoShoutbox.shoutframe).each(function (index) {
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