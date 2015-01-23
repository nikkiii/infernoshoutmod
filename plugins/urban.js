define(function() {
	var UrbanPlugin = function(mod) {
		var UrbanCommandHandler = function(cmd, args) {
			if (args.length < 1) {
				return;
			}
			$.ajax({
				url: 'http://api.urbandictionary.com/v0/define',
				traditional: true,
				data: {
					'term': args
				},
				dataType: 'json',
				success: function(result) {
					if (result && result.hasOwnProperty('list')) {
						var definition = result['list'][0]['definition'];
						definition = definition.replace(/(?:\r\n|\r|\n)/g, ' ');
						var message = '!' + cmd + ' ' + args + ' - ' + definition;
						InfernoShoutbox.postShout(message);
					}
				}
			});
		};
		mod.registerCommand('urban', UrbanCommandHandler);
	};

	return {
		id: 'urban',
		init: UrbanPlugin
	};
});