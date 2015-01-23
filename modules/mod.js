define(['minivents'], function(Events) {
	// Helper used when loading the userid
	$.expr[':'].vbInitScript = function(obj, index, meta, stack){
		return !obj.src && obj.innerHTML.indexOf('BBURL') !== -1;
	};

	function InfernoShoutMod() {
		this.commands = {};
		this.plugins = [];
		this.userId = -1;
		this.events = new Events(this);
	}

	InfernoShoutMod.prototype.init = function() {
		var self = this;
		InfernoShoutbox.setUserGroup = function(id) {
			this.shout.ajax = new vB_AJAX_Handler(true);
			this.shout.ajax.send('profile.php', 'do=updatedisplaygroup&usergroupid=' + id + '&');
		};

		InfernoShoutbox.postShout = function(message) {
			this.posting_shout = true;
			this.set_loader('');

			message = InfernoShoutbox.shout_params.prefix + message + InfernoShoutbox.shout_params.suffix;

			this.shout.ajax = new vB_AJAX_Handler(true);
			this.shout.ajax.onreadystatechange(InfernoShoutbox.shout_posted);
			this.shout.ajax.send('infernoshout.php', 'do=shout&message=' + PHP.urlencode(message) + '&');

			this.clear();
		};

		InfernoShoutbox.postEditShout = function(shoutid, message) {
			this.editshout.ajax = new vB_AJAX_Handler(true);
			this.editshout.ajax.shoutid = shoutid;
			this.editshout.ajax.dodelete = 0;
			this.editshout.ajax.onreadystatechange(InfernoShoutbox.edit_shout_done);
			this.editshout.ajax.send('infernoshout.php', 'do=doeditshout&shoutid=' + shoutid + '&shout=' + message + '&delete=0&');
		};

		InfernoShoutbox.postDeleteShout = function(shoutid) {
			this.editshout.ajax = new vB_AJAX_Handler(true);
			this.editshout.ajax.shoutid = shoutid;
			this.editshout.ajax.dodelete = 1;
			this.editshout.ajax.onreadystatechange(InfernoShoutbox.edit_shout_done);
			this.editshout.ajax.send('infernoshout.php', 'do=doeditshout&shoutid=' + shoutid + '&shout=(deleted message)&delete=1&');
		};

		InfernoShoutbox.update_shouts = function(shouts) {
			var error = shouts.indexOf('The server is too busy at the moment. Please try again later.') !== -1;

			if (error) {
				this.shoutframe.innerHTML = "The server is too busy at the moment. Please try again later.";
			} else {
				var event = new ShoutUpdateEvent(shouts);

				self.emit('update_shouts', event);

				if (!event.shoutHtml) {
					return;
				}

				this.shoutframe.innerHTML = event.shoutHtml;
			}

			if (this.newestbottom && this.shoutframe.scrollTop < this.shoutframe.scrollHeight) {
				this.shoutframe.scrollTop = this.shoutframe.scrollHeight;
			}

			if (!error) {
				self.emit('update_shouts_post');
			}
		};

		InfernoShoutbox.fetch_users_completed = function () {
			ajax = InfernoShoutbox.fetchusers.ajax;
			if (ajax.handler.readyState == 4 && ajax.handler.status == 200) {
				document.getElementById("users").innerHTML = ajax.handler.responseText;

				self.emit('users_update');
			}
		};

		// BETTER pming.
		InfernoShoutbox.open_pm_tab = function(pmid, username) {
			if (!this.pm_tabs) {
				this.pm_tabs = {};
			}
			if (this.pm_tabs[pmid]) {
				this.goto_pm_window(pmid);
				return false;
			}
			var userid = pmid.split('_')[1];
			this.append_tab('<a href="#" onclick="return InfernoShoutbox.goto_pm_window(\'' + pmid + '\');">' + username + '</a>', 1);
			this.append_shout_window(pmid, '/pm ' + userid + '; ', '', 'pmonly&pmid=' + userid);
			this.goto_pm_window(pmid);
			return false;
		};

		InfernoShoutbox.shout = function() {
			if (this.posting_shout) {
				this.show_notice('A previous message is still being submitted.');
				return false;
			}

			if (this.idle) {
				this.hide_notice();
			}
			this.idle = false;
			this.idletime = 0;

			message = this.editor.value;
			if (PHP.trim(message) == '') {
				this.show_notice('Please enter a message first.');
				return false;
			}

			var evt = new MessageEvent(message);

			self.emit('shout', evt);

			message = evt.message;

			if (!message) {
				return false;
			}

			if (message.length > 1 && (message.indexOf('!') == 0 || message.indexOf('/') == 0)) {
				if (self.handleCommand(message.substring(1))) {
					this.clear();
					return false;
				}
			}

			this.postShout(message);
			return false;
		};

		var $initScript = $('head > script:vbInitScript');

		if ($initScript.length > 0) {
			var initScriptData = $initScript.html();

			var match = /var LOGGEDIN = (\d+) > 0 \? true : false;/.exec(initScriptData);

			if (match) {
				self.userId = parseInt(match[1]);
			}

			self.username = $(".welcomelink a").text();
		}
	};

	InfernoShoutMod.prototype.onPluginLoad = function(plugin) {
		this.plugins.push(plugin);
		this.emit('pluginLoad', plugin);
	};

	function MessageEvent(message) {
		this.message = message;
	}

	function ShoutUpdateEvent(shoutHtml) {
		this.shoutHtml = shoutHtml;
	}

	return InfernoShoutMod;
});