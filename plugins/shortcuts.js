define(function() {
	var ShortcutPlugin = function(mod) {
		mod.registerCommand('u', function(cmd, args) {
			InfernoShoutbox.postShout('[user]' + args.join(' ') + '[/user]');
		});

		mod.registerCommand('m', function(cmd, args) {
			InfernoShoutbox.postShout('[url=http://www.rune-server.org/programming/website-development/projects/564248-infernoshoutmod.html]InfernoShoutMod[/url]');
		});

		mod.registerCommand('prefix', function(cmd, args) {
			InfernoShoutbox.shout_params.prefix = args.join(' ');
		});

		mod.registerCommand('suffix', function(cmd, args) {
			InfernoShoutbox.shout_params.suffix = args.join(' ');
		});

		var shorthands = {
			'p' : 'prune',
			'b' : 'ban',
			'ub' : 'unban',

			'pre' : 'prefix',
			'su' : 'suffix'
		};

		var shortExec = function(cmd, args) {
			var commandStr = '/' + shorthands[cmd];

			if (args.length > 0) {
				commandStr += ' ' + args.join(' ');
			}

			if (mod.handleCommand(commandStr)) {
				return;
			}

			InfernoShoutbox.postShout(commandStr);
		};

		for (var short in shorthands) {
			mod.registerCommand(short, shortExec);
		}
	};

	return {
		id : 'shortcuts',
		init : ShortcutPlugin
	};
});