define(['htmlparser', 'soupselect', 'vbutil', 'noty'], function(HtmlParser, SoupSelect, vbutil) {
	var IgnorePluginInit = function(mod) {
		var ignores = [],
			ignoreNames = [];

		$.expr[':'].isShoutUser = function(obj, index, meta, stack){
			obj = $('a:first', obj).get(0);

			if (!obj || !obj.onclick) {
				return;
			}

			var matches = /pm_(\d+)/.exec(new String(obj.onclick));

			return parseInt(matches[1]) == parseInt(meta[3]);
		};

		$.expr[':'].ignoredUser = function(obj, index, meta, stack){
			var $obj = $(obj),
				html = $obj.html();

			var matches = /pm_(\d+)/.exec(html);

			if (matches && ignores.indexOf(parseInt(matches[1])) !== -1) {
				return true;
			}

			// Handles /me and prune, ban, silence notifications
			if (PHP.trim(html)[0] == '*') {
				var $span = $obj.children('span, font');

				if ($span.length > 0) {
					return ignoreNames.indexOf($span.text()) !== -1;
				}

				html = html.substring(1);

				for (i = 0; i < ignoreNames.length; i++) {
					if (html.indexOf(ignoreNames[i]) == 0) {
						return true;
					}
				}
			}

			return false;
		};

		var nameCache = {};

		function updateName(v, name) {
			$('#ignore-' + v + ' > a:first').text(name);
			nameCache[v] = name;

			if (ignoreNames.indexOf(name) == -1) {
				ignoreNames.push(name);
			}
		}

		function refreshName(v) {
			if (v in nameCache) {
				$('#ignore-' + v + ' > a:first').text(nameCache[v]);
				return;
			}

			vbutil.findUserById(v, function(name) {
				if (!name) {
					return;
				}

				updateName(v, name);
			});
		}

		function appendIgnoredUser(userid, trigger) {
			var $user = $('#shoutbox_frame').children('.smallfont:isShoutUser(' + userid + ')');

			var name = $user.length > 0 ? $user.children('a:first').text() : userid;

			var $elem = $('#infernoshoutmod-setting-ignored-users');

			var $li = $('<li />').attr('id', 'ignore-' + userid).data('userid', userid);
			$li.append($('<a />').attr('href', 'member.php?u=' + userid).html(name));
			$li.append(' <a id="infernoshoutmod-ignore-remove" href="#"><i class="fa fa-times"></i></a>');
			$li.appendTo($elem);

			if ($user.length < 1) {
				refreshName(userid);
			}

			if (trigger) {
				$elem.trigger('change');
			}
		}

		var populator = function($elem, value) {
			value.sort();
			var i;
			for (i = 0; i < value.length; i++) {
				appendIgnoredUser(value[i]);
			}
		};

		var parser = function($elem) {
			var ids = [];
			$elem.children('li').each(function(index) {
				ids.push($(this).data('userid'));
			});
			return ids;
		};

		mod.addSetting('ignored-users', { parser : parser, populator : populator }, function(val) {
			ignores = val;
		});

		mod.registerCommand('ignore', function(cmd, args) {
			var user = args.join(' ');

			vbutil.findUser(user, function(id, name) {
				if (id == -1) {
					noty({ text : 'Unable to find user ' + user, type : 'error', timeout : 5000 });
					return;
				}

				if (id == mod.userId) {
					noty({ text : 'You cannot ignore yourself.', type : 'error', timeout : 5000 });
					return;
				}

				if (ignores.indexOf(id) !== -1) {
					return;
				}

				ignores.push(id);

				appendIgnoredUser(id, true);

				noty({ text : 'Successfully ignored ' + name + '.', type : 'success', timeout : 5000 });
			});
		});

		mod.registerCommand('unignore', function(cmd, args) {
			var user = args.join(' ');

			vbutil.findUser(user, function(id, name) {
				if (id == -1) {
					noty({ text : 'Unable to find user ' + user, type : 'error', timeout : 5000 });
					return;
				}

				var idx = ignores.indexOf(id);

				if (idx !== -1) {
					var $elem = $('#infernoshoutmod-setting-ignored-users');

					$elem.children('#ignore-' + id).remove();

					$elem.trigger('change');

					delete ignores[idx];

					var nameIdx = ignoreNames.indexOf(nameCache[id]);

					if (nameIdx != -1) {
						delete ignoreNames[idx];
					}

					noty({ text : 'Successfully removed ' + name + ' from ignore list.', type : 'success', timeout : 5000 });
				}
			});
		});

		mod.on('update_shouts', function(ctx, shouts) {
			$('#shoutbox_frame').children('.smallfont:ignoredUser').remove();
		});
	};

	return {
		init : IgnorePluginInit
	};
});