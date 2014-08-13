define(function() {
	var ShoutQuotingPlugin = function(mod) {
		mod.on('update_shouts', function() {
			$('div', InfernoShoutbox.shoutframe).each(function (index) {
				if (this.ondblclick != null) {
					return;
				}

				$(this).dblclick(function () {
					InfernoShoutbox.editor.value = PHP.trim($(this).text());
				});
			});
		});
	};

	return {
		init : ShoutQuotingPlugin
	};
});