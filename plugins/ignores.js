define(['htmlparser', 'soupselect', 'vbutil'], function(HtmlParser, SoupSelect, vbutil) {
	var ID_REGEXP = new RegExp(/pm_(\d+)/);

	var IgnorePluginInit = function(mod) {
		var ignores = [];

		$.expr[':'].isShoutUser = function(obj, index, meta, stack){
			obj = $('a:first', obj).get(0);

			if (!obj || !obj.onclick) {
				return;
			}

			var matches = ID_REGEXP.exec(new String(obj.onclick));

			return parseInt(matches[1]) == parseInt(meta[3]);
		};

		$.expr[':'].ignoredUser = function(obj, index, meta, stack){
			var html = $(obj).html();

			var matches = ID_REGEXP.exec(html);

			return matches && ignores.indexOf(parseInt(matches[1])) !== -1;
		};

		var nameCache = {};

		function updateName(v, name) {
			$('#ignore-' + v + ' > a:first').text(name);
			nameCache[v] = name;
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

			if (!isNaN(user)) {
				user = parseInt(user);

				if (user == mod.userId) {
					alert('You cannot ignore yourself.');
					return;
				}

				if (ignores.indexOf(user) !== -1) {
					return;
				}

				ignores.push(user);

				appendIgnoredUser(user, true);
			}
		});

		mod.registerCommand('unignore', function(cmd, args) {
			var user = args.join(' ');

			if (!isNaN(user)) {
				var idx = ignores.indexOf(parseInt(user));

				if (idx !== -1) {
					var $elem = $('#infernoshoutmod-setting-ignored-users');

					$elem.children('#ignore-' + user).remove();

					$elem.trigger('change');

					delete ignores[idx];
				}
			}
		});

		mod.on('update_shouts', function(ctx, shouts) {
			$('#shoutbox_frame').children('.smallfont:ignoredUser').remove();
		});
	};

	return {
		init : IgnorePluginInit
	};
});