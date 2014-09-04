define(function() {
	var ShortcutPlugin = function(mod) {
		mod.registerCommand('u', function(cmd, args) {
			InfernoShoutbox.postShout('[user]' + args.join(' ') + '[/user]');
		});

		mod.registerCommand('m', function(cmd, args) {
			InfernoShoutbox.postShout('http://www.rune-server.org/programming/website-development/projects/564248-infernoshoutmod.html');
		});

		var PrefixHandler = function(cmd, args) {
			InfernoShoutbox.shout_params.prefix = args.join(' ');
		};

		mod.registerCommand('pre', PrefixHandler);
		mod.registerCommand('prefix', PrefixHandler);

		var SuffixHandler =  function(cmd, args) {
			InfernoShoutbox.shout_params.suffix = args.join(' ');
		};

		mod.registerCommand('su', SuffixHandler);
		mod.registerCommand('suffix', SuffixHandler);

		var shorthands = {
			'p' : 'prune',
			'b' : 'ban',
			'u' : 'unban'
		};

		var shortExec = function(cmd, args) {
			var argStr = '';

			if (args.length > 0) {
				argStr = ' ' + args.join(' ');
			}

			InfernoShoutbox.shout('/' + shorthands[cmd] + argStr);
		};

		for (var short in shorthands) {
			mod.registerCommand(short, shortExec);
		}
	};

	return {
		init : ShortcutPlugin
	};
});