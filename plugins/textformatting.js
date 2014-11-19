define(function() {
	var TextFormattingPlugin = function(mod) {
		mod.on('shout', function(ctx, evt) {
			// TODO better shortcuts for bold, italics, etc

			if (evt.message.charAt(0) == '>') {
				evt.message = '[color=#789922]' + evt.message + '[/color]';
			}
		});
	};

	return {
		id : 'textformatting',
		init : TextFormattingPlugin
	};
});