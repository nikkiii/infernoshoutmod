var request = require('request').defaults({jar: true}),
	crypto = require('crypto'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	randomstring = require('randomstring'),
	generator = require('./lib/token');

function Auth(url, userId) {
	this.url = url;
	this.userId = userId;
	this.logged = false;
	this.waiting = [];

	this.tokens = JSON.parse(fs.readFileSync('data/auth.json'));
}

Auth.prototype.wrap = function(socket) {
	var self = this;

	var ident = false,
		authToken = '';

	socket.on('ident', function(data) {
		ident = data;
	});

	socket.on('authrequest', function() {
		authToken = generator.generate();

		socket.emit('authtoken', {
			userId : self.userId,
			token : authToken
		});
	});

	socket.on('authsent', function() {
		self.scan(ident.userId, function(shouts) {
			for (var i = 0; i < shouts.length; i++) {
				if (shouts[i].shout.trim() == authToken) {
					self.accept(socket, ident);
					return;
				}
			}

			socket.emit('authfail');
		});
	});
};

Auth.prototype.accept = function(socket, ident) {
	var token = randomstring.generate(32);

	this.registerToken(ident.userId, token);

	socket.emit('authaccept', { token : token });
};

Auth.prototype.registerToken = function(userId, token) {
	this.tokens[userId] = token;

	fs.writeFile('data/auth.json', JSON.stringify(this.tokens));
};

Auth.prototype.validate = function(userId, token) {
	return userId in this.tokens && this.tokens[userId] == token;
};

Auth.prototype.login = function(username, password) {
	var md5 = crypto.createHash('md5');
	md5.update(password);

	var form = {
		'do' : 'login',
		'securitytoken' : 'guest',
		's' : '',
		'cookieuser' : '1',
		'vb_login_username' : username,
		'vb_login_md5password' : md5.digest('hex')
	};

	var self = this;

	request.post(this.url + '/login.php', { form : form }, function(err, response, body) {
		if (response.statusCode == 200) {
			if (body.toLowerCase().indexOf('invalid username or password') !== -1) {
				console.log('Invalid username/password.');
				return;
			}

			self.logged = true;

			self.processQueue();
		}
	});
};

Auth.prototype.scan = function(userId, callback) {
	if (!this.logged) {
		this.waiting.push({ method : 'scan', params : arguments });
		return;
	}

	request.get(this.url + '/infernoshout.php?do=messages&fetchtype=pmonly&pmid=' + userId, function(err, response, body) {
		var $ = cheerio.load(body);

		var shouts = [];

		$('.smallfont').not(function(index, element) {
			return $(this).text().trim().indexOf('Notice') == 0;
		}).each(function(index, element) {
			var $this = $(this);

			var time = $this.children('.time').first(),
				anchor = $this.children('a').first(),
				shout = $this.html().substring($this.html().indexOf('</a>:') + 5).trim();

			shouts.push({
				time : time.text(),
				userId : /pm_(\d+)/.exec(anchor.attr('onclick'))[1],
				username : anchor.text(),
				shout : shout
			});
		});

		callback(shouts);
	});
};

Auth.prototype.processQueue = function() {
	for (var i = 0; i < this.waiting.length; i++) {
		var job = this.waiting[i];

		Auth.prototype[job.method].apply(this, job.params);
	}
};

module.exports = Auth;