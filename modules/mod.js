define(['minivents'], function (Events) {
	function InfernoShoutMod() {
		this.commands = {};
		this.events = new Events();
	}

	InfernoShoutMod.prototype.init = function () {
		var self = this;
		InfernoShoutbox.setUserGroup = function (id) {
			this.shout.ajax = new vB_AJAX_Handler(true);
			this.shout.ajax.send('profile.php', 'do=updatedisplaygroup&usergroupid=' + id + '&');
		};

		InfernoShoutbox.postShout = function (message) {
			this.posting_shout = true;
			this.set_loader('');

			this.shout.ajax = new vB_AJAX_Handler(true);
			this.shout.ajax.onreadystatechange(InfernoShoutbox.shout_posted);
			this.shout.ajax.send('infernoshout.php', 'do=shout&message=' + PHP.urlencode(message) + '&');

			this.clear();
		};

		InfernoShoutbox.postEditShout = function (shoutid, message) {
			this.editshout.ajax = new vB_AJAX_Handler(true);
			this.editshout.ajax.shoutid = shoutid;
			this.editshout.ajax.dodelete = 0;
			this.editshout.ajax.onreadystatechange(InfernoShoutbox.edit_shout_done);
			this.editshout.ajax.send('infernoshout.php', 'do=doeditshout&shoutid=' + shoutid + '&shout=' + message + '&delete=0&');
		};

		InfernoShoutbox.postDeleteShout = function (shoutid) {
			this.editshout.ajax = new vB_AJAX_Handler(true);
			this.editshout.ajax.shoutid = shoutid;
			this.editshout.ajax.dodelete = 1;
			this.editshout.ajax.onreadystatechange(InfernoShoutbox.edit_shout_done);
			this.editshout.ajax.send('infernoshout.php', 'do=doeditshout&shoutid=' + shoutid + '&shout=(deleted message)&delete=1&');
		};

		InfernoShoutbox.idlecheck = function () {

		};

		InfernoShoutbox.update_shouts = function (shouts) {
			this.shoutframe.innerHTML = shouts;

			if (this.newestbottom && this.shoutframe.scrollTop < this.shoutframe.scrollHeight) {
				this.shoutframe.scrollTop = this.shoutframe.scrollHeight;
			}

			self.events.emit('update_shouts', shouts);
		};

		// BETTER pming.
		InfernoShoutbox.open_pm_tab = function (pmid, username) {
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

		InfernoShoutbox.shout = function () {
			if (this.posting_shout) {
				this.show_notice('A previous message is still being submitted.');
				return false;
			}

			message = this.editor.value;
			if (PHP.trim(message) == '') {
				this.show_notice('Please enter a message first.');
				return false;
			}

			var evt = new MessageEvent(message);

			self.events.emit('shout', evt);

			message = evt.message;

			if (!message) {
				return false;
			}

			if (message.indexOf('!') == 0 && message.length > 1) {
				if (self.handleCommand(message.substring(1))) {
					this.clear();
					return false;
				}
			}

			message = this.shout_params.prefix + message + this.shout_params.suffix;

			this.postShout(message);
			return false;
		};
	};

	function MessageEvent(message) {
		this.message = message;
	}

	return InfernoShoutMod;
});