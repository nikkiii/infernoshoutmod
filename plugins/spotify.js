define(['noty', '../lib/util'], function(noty, Util) {
	var SpotifyPlugin = function(mod) {
		mod.registerCommand('spotify', function(cmd, args) {
			if (args.length < 1) {
				return;
			}
			args = args.join(' ');
			$.ajax({
				url: 'https://api.spotify.com/v1/search',
				data: {
					'q': args,
					'type' : 'track'
				},
				dataType: 'json',
				success: function(result) {
					if (result && result.hasOwnProperty('tracks') && result['tracks']['items'].length > 0) {
						var track = result['tracks']['items'][0];

						InfernoShoutbox.postShout('[url=' + track.external_urls.spotify + ']' + Util.filterTitle(track.name) + ' on Spotify (Search Result)[/url]');
					} else {
						noty({ text : 'Unable to find a spotify track for "' + args + '"', type : 'error' });
					}
				}
			});
		});
	};

	return {
		id: 'spotify',
		init: SpotifyPlugin
	};
});