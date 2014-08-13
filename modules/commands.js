define(['./mod'], function(InfernoShoutMod) {
	InfernoShoutMod.prototype.handleCommand = function(string) {
		var args = this.parseCommandArguments(string);
		var cmd = args[0];

		if (this.commands[cmd] !== undefined) {
			this.commands[cmd](cmd, args.slice(1));
			return true;
		}

		return false;
	};

	InfernoShoutMod.prototype.registerCommand = function (command, func) {
		this.commands[command] = func;
	};

	InfernoShoutMod.prototype.parseCommandArguments = function(command) {
		var args = [];

		var buf = '';
		var quoted = false, escaped = false;

		for (var i = 0; i < command.length; i++) {
			var c = command.charAt(i);
			if (c == ' ' && !quoted) {
				args.push(buf);
				buf = '';
			} else if (c == '"' && !escaped) {
				quoted = !quoted;
			} else if (c == '\\') {
				escaped = true;
			} else {
				escaped = false;
				buf += c;
			}
		}

		if (buf.length > 0)
			args.push(buf);

		return args;
	};
});