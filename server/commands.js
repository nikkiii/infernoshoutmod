var glob = require("glob");

function CommandContext(server, commandString, command, args) {
	this.server = server;
	this.commandString = commandString;
	this.command = command;
	this.args = args;
}

function CommandHandler(server) {
	this.server = server;
	this.commands = {};

	this.load();
}

CommandHandler.prototype.load = function() {
	var self = this;

	glob('commands/*.js', function(err, files) {
		for (var i = 0; i < files.length; i++) {
			var file = files[i],
				name = file.substring(file.indexOf('/') + 1, file.lastIndexOf('.'));

			console.log('Register ' + name + ' from ' + file);

			self.register(name, require('./' + file));
		}
	});
};

CommandHandler.prototype.register = function(command, handler) {
	this.commands[command] = handler;
};

CommandHandler.prototype.handle = function(ident, commandString) {
	var args = this.parse(commandString),
		command = args.shift();

	if (command in this.commands) {
		var info = this.commands[command];

		if (info.groups.indexOf(ident.group) !== -1) {
			var ctx = new CommandContext(this.server, commandString, command, args);
			info.handler.apply(ctx, [ ident ]);
		}

		return true;
	}
	return false;
};

CommandHandler.prototype.parse = function(command) {
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

module.exports = CommandHandler;