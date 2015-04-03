define(['https://cdn.socket.io/socket.io-1.2.0.js', 'vbutil', 'http://cdn.probablyaserver.com/libs/jquery-ui/jquery-ui.min.js'], function(io, vbutil) {
	function shoutTimestamp(date) {
		var today = Date.parse('t');
		var yesterday = Date.parse('yesterday');

		var pre = '';

		if (date.compareTo(today) > 0) {
			pre = 'Today';
		} else if (date.between(yesterday, today)) {
			pre = 'Yesterday';
		} else {
			pre = date.toString('MM/dd/yy');
		}

		return pre + ' ' + date.toString("hh:mm tt")
	}
	var WebSocketPlugin = function(mod) {
		var smilies = { };

		vbutil.getSmileyList(function(result) {
			smilies = result;
		});

		// Define our templates.
		var templates =  {
				regular : '<div style="padding-top: 1px; padding-bottom: 1px;" class="smallfont">[<span class="time"></span>] <a href="#">{displayName}</a>: {message}</div>',
				self : '<div style="padding-top: 1px; padding-bottom: 1px;" class="smallfont">* {displayName} {message}*</div>',
				notice : '<div style="padding-top: 1px; padding-bottom: 1px;padding-bottom: 6px;" class="smallfont notice">Notice: {notice}</div>'
			};

		var $tab = mod.addStaticTab('ismchat', 'ISM Chat', '', {
			shout_params : {
				prefix : '/ismchat '
			}
		});

		var $chat = $tab.children('.content_box');

		function replaceNamed(str, args) {
			return str.replace(/{([a-zA-Z0-9]+)}/g, function(match, key) {
				return typeof args[key] != 'undefined'
					? args[key]
					: match
					;
			});
		}

		function pushMessage(data) {
			// Cheap way to do smilies for now.
			for (var key in smilies) {
				data.message = data.message.replace(key, '<img src="' + smilies[key] + '" alt="" />');
			}

			var tpl = templates.regular;

			if ('type' in data && data.type in templates) {
				tpl = templates[data.type];
			}

			// Construct a new node for the line.
			var $line = $(replaceNamed(tpl, {
				message : data.message,
				displayName : data.ident.displayName
			}));
			$line.data('ident', data.ident);
			$line.find('.time').text(shoutTimestamp(new Date(data.date)));

			// Append to the appropriate place.
			var $notice = $chat.find('.notice');
			if ($notice.length) {
				$notice.after($line);
			} else {
				$chat.prepend($line);
			}
		}

		var socket = io('http://nikkii.us:3860/');

		socket.on('connect', function() {
			socket.emit('ident', { userId : mod.userId, username : mod.username, token : localStorage['ismchat_token'] });
		});

		socket.on('history', function(items) {
			if (items.length < 1) {
				return;
			}
			for (var i = items.length - 1; i >= 0; i--) {
				pushMessage(items[i]);
			}
		});

		socket.on('message', function(data) {
			pushMessage(data);

			if (!$tab.is(':visible')) {
				$('#InfernoShoutMod-Tab-ismchat').effect("pulsate", { times:3 }, 2000);
			}
		});

		socket.on('notice', function(data) {
			var $notice = $chat.find('.notice');
			if ($notice.length) {
				$notice.text('Notice: ' + data.notice);
			} else {
				$notice = $(templates.notice.replace(/\{notice\}/, data.notice));
				$chat.prepend($notice);
			}
		});

		socket.on('prune', function(data) {
			var $children = $chat.children(':not(.notice)');
			if (data && 'userId' in data) {
				$children.each(function() {
					var $this = $(this),
						ident = $this.data('ident');

					if (ident.userId == data.userId) {
						$this.remove();
					}
				});
			} else {
				$children.remove();
			}
		});

		socket.on('authtoken', function(data) {
			// Send pm to data.userId with contents data.token, then on success send an event back.
			var message = '/pm ' + data.userId + '; ' + data.token;

			$.post('/infernoshout.php', { 'do' : 'shout', 'message' : message, securitytoken : SECURITYTOKEN }, function(res) {
				if (res == 'completed') {
					socket.emit('authsent');
				}
			});
		});

		socket.on('authaccept', function(data) {
			console.log('[ISM Chat] Accepted auth ' + data.token);

			localStorage.setItem('ismchat_token', data.token);

			socket.emit('ident', { userId : mod.userId, username : mod.username, token : data.token });
		});

		mod.registerCommand('ismauth', function(cmd, args) {
			socket.emit('authrequest');
		});

		mod.registerCommand('ismchat', function(cmd, args) {
			socket.emit('message', {
				message : args.join(' ')
			}, function(resp) {
				if (!resp.success && resp.message) {
					InfernoShoutbox.show_notice(resp.message);
				}
			});
		});
	};

	return {
		id: 'websocketchat',
		init: WebSocketPlugin
	};
});