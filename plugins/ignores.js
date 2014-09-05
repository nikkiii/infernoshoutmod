define(function() {
	var IgnorePluginInit = function(mod) {
		var ignores = [];

		var ID_REGEXP = new RegExp(/pm_(\d+)/);

		$.expr[':'].ignoredUser = function(obj, index, meta, stack){
			var html = $(obj).html();

			var matches = ID_REGEXP.exec(html);

			return matches && ignores.indexOf(parseInt(matches[1])) !== -1;
		};

		var populator = function($elem, value) {
			value.sort();
			var i;
			for (i = 0; i < value.length; i++) {
				var v = value[i];

				var $li = $('<li />').attr('id', 'ignore-' + v);
				$li.append($('<a />').attr('href', 'member.php?u=' + v).text(v));
				$li.append(' <a id="infernoshoutmod-ignore-remove" href="#"><i class="fa fa-times"></i></a>');
				$li.appendTo($elem);
			}
		};

		var parser = function($elem) {
			var ids = [];
			$elem.children('li').each(function(index) {
				ids.push($(this).text());
			});
			return ids;
		};

		mod.addSetting('ignored-users', { parser : parser, populator : populator }, function(val) {
			ignored = val;
		});

		mod.registerCommand('ignore', function(cmd, args) {
			var user = args.join(' ');

			if (isNaN(user)) {
				// Find name from member page?
			} else {
				user = parseInt(user);

				if (ignores.indexOf(user) !== -1) {
					return;
				}

				ignores.push(user);

				var $elem = $('#infernoshoutmod-setting-ignored-users');

				var $li = $('<li />').attr('id', 'ignore-' + user);
				$li.append($('<a />').attr('href', 'member.php?u=' + user).html(user));
				$li.append(' <a id="infernoshoutmod-ignore-remove" href="#"><i class="fa fa-times"></i></a>');
				$li.appendTo($elem);

				$elem.trigger('change');
			}
		});

		mod.registerCommand('unignore', function(cmd, args) {
			var user = args.join(' ');

			if (isNaN(user)) {
				// Find name from member page?
			} else {
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