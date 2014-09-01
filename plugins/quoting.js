define(function() {
	var ShoutQuotingPlugin = function(mod) {
		$('#shoutbox_frame').on('dblclick', 'div.smallfont', function() {
			InfernoShoutbox.editor.value = PHP.trim($(this).text());
		});
	};

	return {
		init: ShoutQuotingPlugin
	};
});