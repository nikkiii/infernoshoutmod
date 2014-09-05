define(function() {
	var ShoutReplacePlugin = function(mod) {
		var ID_REGEXP = new RegExp(/pm_(\d+)/);
		$.expr[':'].isShoutUser = function(obj, index, meta, stack){
			if (obj.ondblclick == undefined || typeof(obj.ondblclick) !== 'function') {
				return false;
			}

			if (!obj.onclick) {
				return;
			}

			var matches = ID_REGEXP.exec(new String(obj.onclick));

			return matches[1] === meta;
		};

		function preg_quote(str, delimiter) {
			//  discuss at: http://phpjs.org/functions/preg_quote/
			// original by: booeyOH
			// improved by: Ates Goral (http://magnetiq.com)
			// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// improved by: Brett Zamir (http://brett-zamir.me)
			// bugfixed by: Onno Marsman
			//   example 1: preg_quote("$40");
			//   returns 1: '\\$40'
			//   example 2: preg_quote("*RRRING* Hello?");
			//   returns 2: '\\*RRRING\\* Hello\\?'
			//   example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
			//   returns 3: '\\\\\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:'

			return String(str)
				.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
		}

		var REPLACE_REGEXP = new RegExp(/^s\/(.*)\/(.*)\/$/),
			shoutIdRegex = new RegExp(/edit_shout\((\d+)\)/);

		mod.on('shout', function(ctx, evt) {
			var match = REPLACE_REGEXP.exec(evt.message);

			if (match) {
				var $row = $('#shoutbox_frame > .smallfont:isShoutUser(' + mod.userId + ')');

				if ($row.length < 1) {
					return;
				}

				var row = $row.get(0);

				if (!row || !row.ondblclick) {
					return;
				}

				var dblclick = new String(row.ondblclick);

				var id = shoutIdRegex.exec(dblclick);
				id = id[1];

				var replace_shout_fetched = function() {
					ajax = InfernoShoutbox.editshout.ajax;
					if (ajax.handler.readyState == 4 && ajax.handler.status == 200) {
						InfernoShoutbox.set_loader('none');
						if (ajax.handler.responseText != 'deny') {
							var data = ajax.handler.responseText.split(InfernoShoutbox.parsebreaker);

							var newMsg = data[0].replace(new RegExp(preg_quote(match[1]), 'gi'), match[2]);

							InfernoShoutbox.postEditShout(parseInt(data[1]), newMsg);
						} else {
							InfernoShoutbox.posting_shout = false;
						}
					}
				};

				InfernoShoutbox.editshout.ajax = new vB_AJAX_Handler(true);
				InfernoShoutbox.editshout.ajax.onreadystatechange(replace_shout_fetched);
				InfernoShoutbox.editshout.ajax.send('infernoshout.php', 'do=editshout&shoutid=' + id + '&');

				InfernoShoutbox.clear();

				evt.message = false;
				ctx.breakHandlerChain();
			}
		});
	};

	return {
		init: ShoutReplacePlugin
	};
});