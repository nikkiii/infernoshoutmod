define(function() {
	var ShoutQuotingPlugin = function(mod) {
		$('#shoutbox_frame > div.smallfont').on('dblclick', function() {
			InfernoShoutbox.editor.value = PHP.trim($(this).text());
		});
	};

	return {
		init : ShoutQuotingPlugin
	};
});