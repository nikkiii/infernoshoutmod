define(function() {
	var TextFormattingPlugin = function(mod) {
		mod.on('shout', function(ctx, evt) {
			evt.message = evt.message.replace(/\*\*\*([^\*].*?)\*\*\*/gmi, "[b][i]$1[/i][/b]") // bold + itlaic
				.replace(/\*\*([^\*].*?)\*\*/gmi, "[b]$1[/b]") // bold
				.replace(/(\s)\*((?!\/[0-9]|\s|\*).*?)\*(\s)/gmi, "$1[i]$2[/i]$3");  // italic
		});
	};

	return {
		init : TextFormattingPlugin
	};
});