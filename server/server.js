var fs = require('fs'),
	CommandHandler = require('./commands'),
	Autolinker = require( 'autolinker' ),
	bbcode = require('./bbcode');

var FixedQueue = require('./fixedqueue');

function ISMShoutServer() {
	this.history = FixedQueue(50);
	this.commands = new CommandHandler(this);

	this.groups = JSON.parse(fs.readFileSync('data/groups.json'));
	this.banList = JSON.parse(fs.readFileSync('data/bans.json'));

	this.notice = false;
}

ISMShoutServer.prototype.start = function() {
	var app = require('express')(),
		http = require('http').Server(app);

	var io = this.io = require('socket.io')(http);

	var self = this;

	io.on('connection', function(socket) {
		if (self.notice) {
			socket.emit('notice', { notice : self.notice });
		}

		socket.emit('history', self.history);

		var ident = false;

		socket.on('ident', function(data) {
			if (!validateObject(data, [ 'userId', 'username' ])) {
				socket.close();
				return;
			}

			data.userId = parseInt(data.userId);

			ident = data;

			var group = ident.group = self.groupOf(ident.userId, ident.username);

			// Apply ranks.
			self.applyRanks(ident, group);
		});

		socket.on('message', function(msg, fn) {
			if (!ident) {
				fn({ success : false, message : 'Error. No identification received.' });
				return;
			}

			if (!validateObject(msg, [ 'message' ])) {
				fn({ success : false });
				return;
			}

			self.pushMessage(ident, msg, fn);
		});
	});

	http.listen(3860, function(){
		console.log('listening on *:3860');
	});
};

ISMShoutServer.prototype.pushMessage = function(ident, msg, fn) {
	// Strip html.
	msg.message = msg.message.replace(/(<([^>]+)>)/ig, "");

	if (msg.message.charAt(0) == '/') {
		if (this.handleCommand(ident, msg.message.substring(1))) {
			if (fn) {
				fn({ success:true });
			}
			return;
		}
	}

	if (this.banList.indexOf(ident.userId) > -1) {
		if (fn) {
			fn({ success : false, message : 'You are banned!' });
		}
		return;
	}
	
	msg.message = this.parseMessage(msg.message);

	// Assign data.
	msg.ident = ident;
	msg.date = new Date();

	this.history.unshift(msg);
	this.io.emit('message', msg);

	if (fn) {
		fn({ success:true });
	}
};

ISMShoutServer.prototype.parseMessage = function(message) {
	if (message.length > 250) {
		message = message.substring(0, 250);
	}

	message = bbcode.parse(message);

	message = Autolinker.link(message, {
		stripPrefix : false,
		email : false,
		phone : false,
		twitter : false,
		replaceFn : function(autolinker, match) {
			switch (match.getType()) {
				case 'url':
					return '[url]' + match.getAnchorHref() + '[/url]';
			}
		}
	});
	
	return message;
};

ISMShoutServer.prototype.handleCommand = function(ident, command) {
	return this.commands.handle(ident, command);
};

ISMShoutServer.prototype.setNotice = function(notice) {
	this.notice = notice;

	this.io.emit('notice', { notice : this.notice });
};

ISMShoutServer.prototype.groupOf = function(userid, name) {
	for (var group in this.groups) {
		if (this.groups[group].users.indexOf(name) !== -1 || this.groups[group].users.indexOf(userid) !== -1) {
			return group;
		}
	}
	return 'members';
}

ISMShoutServer.prototype.applyRanks = function(ident, group) {
	if (group == 'members' || !('format' in this.groups[group])) {
		ident.displayName = ident.username;
		return;
	}
	ident.displayName = replaceNamed(this.groups[group].format, ident);
};

ISMShoutServer.prototype.ban = function(userId) {
	var index = this.banList.indexOf(userId);

	if (index == -1) {
		this.banList.push(userId);

		fs.writeFile('data/bans.json', JSON.stringify(this.banList));

		return true;
	}

	return false;
};

ISMShoutServer.prototype.unban = function(userId) {
	var index = this.banList.indexOf(userId);

	if (index > -1) {
		this.banList.splice(index, 1);

		fs.writeFile('data/bans.json', JSON.stringify(this.banList));

		return true;
	}

	return false;
};

ISMShoutServer.prototype.prune = function(userId) {
	var count = 0;

	if (userId) {
		var filter = function(msg) { return msg.ident.userId == userId };

		var oldHistory = this.history;

		this.history = FixedQueue(50);

		for (var i = 0; i < oldHistory.length; i++) {
			if (filter(oldHistory[i])) {
				this.history.push(oldHistory[[i]]);
				count++;
			}
		}
	} else {
		count = this.history.length;
		this.history.splice(0, this.history.length);
	}

	this.io.emit('prune', userId ? { userId : userId } : {});

	return count;
};

function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}

function replaceNamed(str, args) {
	return str.replace(/{([a-zA-Z0-9]+)}/g, function(match, key) {
		return typeof args[key] != 'undefined'
			? args[key]
			: match
			;
	});
}

function validateObject(object, keys) {
	for (var key in object) {
		if (keys.indexOf(key) == -1) {
			return false;
		}
	}
	return true;
}

module.exports = ISMShoutServer;