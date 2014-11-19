define(['../modules/util'], function(Util) {
	function YoutubeHandler(url, callback) {
		var video = '';

		if (url.indexOf('v=') != -1) {
			// The best way to do it. Parse all query string variables, then get the "v" variable.
			var queryString = url.substring(url.indexOf('?') + 1);

			if (queryString.indexOf('#') != -1) {
				queryString = queryString.substring(0, queryString.indexOf('#'));
			}

			var parts = Util.parseQueryString(queryString);

			video = parts['v'];
		} else if (url.indexOf('youtu.be') != -1) {
			// This is messy, but without a parse url function it'll have to do.
			video = url.substring(url.lastIndexOf('/') + 1);

			if (video.indexOf('?') != -1) {
				video = video.substring(0, video.indexOf('?'));
			}
			if (video.indexOf('#') != -1) {
				video = video.substring(0, video.indexOf('#'));
			}
		}

		if (video == '') {
			return;
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

					var minutes = Math.floor(length / 60);
					var seconds = length % 60;

					callback(Util.filterTitle(title) + ' [' + minutes + ':' + (seconds < 10 ? ('0' + seconds) : seconds) + ']');
				} else {
					callback(false);
				}
			}
		});
	}

	function TwitchHandler(url, callback) {
		var name = /^http(s?):\/\/www\.twitch\.tv\/(.*?)$/.exec(url);

		if (!name || name.length < 1) {
			callback(false);
			return;
		}

		$.ajax({
			url: 'https://api.twitch.tv/kraken/channels/' + name[2],
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

			var callback = function(replacement) {
				if (replacement) {
					message = message.replace(url, '[url=' + url + ']' + replacement + '[/url]');
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