define(['../modules/util'], function(Util) {
	function YoutubeHandler(url, callback) {
		var video = '';

		var info = Util.parseURL(url);

		if ('v' in info.queryObject) {
			video = info.queryObject['v'];
		} else if (info.host == 'youtu.be') {
			video = info.pathname.substring(1);
		}

		if (video == '') {
			return;
		}

		var startTime = false;

		if ('t' in info.queryObject) {
			startTime = info.queryObject['t'];
		} else if (/t\=/.test(info.hash)) {
			var hashInfo = Util.parseQueryString(info.hash.substring(1));

			if ('t' in hashInfo) {
				startTime = hashInfo['t'];
			}
		}

		if (startTime) {
			var match = /(\d+h)?(\d+m)?(\d+s)/.exec(startTime);

			if (match && (match[1] || match[2] || match[3])) {
				var h = match[1].replace(/h$/, ''), m = match[2].replace(/m$/, ''), s = match[3].replace(/s$/, '');

				startTime = '';

				if (h && h.length > 0) {
					startTime = h + ':';
				}

				startTime += (m < 10 ? ('0' + m) : m) + ':' + (s < 10 ? ('0' + s) : s);
			} else {
				startTime = Util.secondsToHMS(startTime);
			}
		}

		$.ajax({
			url: '//gdata.youtube.com/feeds/api/videos',
			data: {
				q: video,
				alt: 'json'
			},
			dataType: 'jsonp',
			success: function(result) {
				if (result['feed'] && result['feed']['entry'] && result['feed']['entry'].length > 0) {
					var length = parseInt(result['feed']['entry'][0]['media$group']['media$content'][0]['duration']);
					var title = result['feed']['entry'][0]['title']['$t'];

					callback(Util.filterTitle(title) + ' [' + Util.secondsToHMS(length) + (startTime ? ', start: ' + startTime : '') + ']');
				} else {
					callback(false);
				}
			}
		});
	}

	function TwitchHandler(url, callback) {
		var info = Util.parseURL(url);

		var directoryMatch = /^\/directory\/game\/(.*?)$/.exec(info.pathname),
			name;

		if (/^\/[^\/]+$/.test(info.pathname)) {
			name = info.pathname.substring(1);
		} else if (directoryMatch) {
			callback('Streams for ' + decodeURIComponent(directoryMatch[1]) + ' on Twitch');
			return;
		} else {
			callback(false);
			return;
		}

		$.ajax({
			url: 'https://api.twitch.tv/kraken/channels/' + name,
			dataType: 'jsonp',
			success: function(result) {
				if (!('error' in result)) {
					var status = result['status'];

					callback(Util.filterTitle(result.display_name) + ' on Twitch - ' + Util.filterTitle(result.status));
				} else {
					callback(false);
				}
			}
		});
	}

	var MediaInfoPlugin = function(mod) {
		// An array of handlers to search.
		var handlers = [
			{
				urls : [ 'youtube.com', 'youtu.be' ],
				handler : YoutubeHandler
			},
			{
				urls : [ 'twitch.tv' ],
				handler : TwitchHandler
			}
		];

		// Register a method to allow plugins to register a media/link info handler.
		mod.registerMediaInfoHandler = function(options) {
			if (!options.urls || !options.handler) {
				// TODO error
				return;
			}
			handlers.push(options);
		};

		mod.on('shout', function(ctx, evt) {
			var message = evt.message;

			if (message.indexOf('[url') !== -1) {
				return;
			}

			var url = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/.exec(message);

			if (!url || url.length < 1) {
				return;
			}

			url = url[0];

			var callback = function(title) {
				if (title) {
					message = message.replace(url, '[url=' + url + ']' + title + '[/url]');
				}
				InfernoShoutbox.postShout(message);
			};

			var handled = false;

			outer_loop:
				for (var i = 0; i < handlers.length; i++) {
					var data = handlers[i];

					for (var l = 0; l < handlers.length; l++) {
						if (url.indexOf(data.urls[l]) !== -1) {
							data.handler(url, callback);
							handled = true;
							break outer_loop;
						}
					}
				}

			if (!handled) {
				return;
			}

			// Clear the text field
			InfernoShoutbox.clear();

			// Break the chain and make sure we don't handle the original method.
			ctx.breakHandlerChain();
			evt.message = false;
		});
	};

	return {
		id : 'mediainfo',
		init : MediaInfoPlugin
	}
});