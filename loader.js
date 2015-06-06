window.InfernoShoutMod = {};

require.config({
	baseUrl : 'http://nikkii.us/sbmod/',
	paths: {
		jquery : 'http://cdn.probablyaserver.com/libs/jquery/2.1.1/jquery.min',
		underscore : 'http://cdn.probablyaserver.com/libs/underscore/1.7.0/underscore.min',
		fontawesome : 'http://cdn.probablyaserver.com/libs/font-awesome/4.2.0/css/font-awesome.min.css',
		noty : 'http://cdn.probablyaserver.com/libs/jquery-noty/2.2.6/jquery.noty.packaged.min',
		minivents : 'lib/minivents',
		htmlparser : 'lib/htmlparser',
		soupselect : 'lib/soupselect',
		idb : 'lib/idb',
		vbutil : 'lib/vbutil',
		util : 'lib/util',
		datejs : 'https://cdnjs.cloudflare.com/ajax/libs/datejs/1.0/date.min'
	},
	shim : {
		noty : {
			deps : ['jquery'],
			exports : 'noty'
		}
	}
});

require(['jquery', 'css!fontawesome'], function($) {
	require(['modules/mod', 'modules/commands', 'modules/tabs', 'modules/settings'], function(InfernoShoutMod) {
		console.log('[InfernoShoutMod] Initial module loading done.');

		var mod = new InfernoShoutMod();
		mod.init();

		console.log('[InfernoShoutMod] Initializing modules...');

		var args = Array.apply([], arguments);
		args = args.slice(1);

		var i;
		for (i = 0; i < args.length; i++) {
			if (typeof args[i] !== 'undefined' && typeof args[i]['init'] !== 'undefined') {
				args[i].init(mod);
			}
		}

		console.log('[InfernoShoutMod] Initialized ' + args.length + ' modules.');

		require([
			'plugins/groupchanger',
			'plugins/ignores',
			'plugins/shoutfunctions',
			'plugins/shoutreplace',
			'plugins/mediainfo',
			'plugins/noshadow',
			'plugins/userhistory',
			'plugins/shortcuts',
			'plugins/simplerep',
			'plugins/emotebar',
			'plugins/smilies',
			'plugins/textformatting',
			'plugins/spotify',
			'plugins/urban',
			'plugins/socketchat',
			'plugins/autocomplete',
			'plugins/customloader' // Load custom plugins last
		], function() {
			var i;
			for(i = 0; i < arguments.length; i++) {
				var plugin = arguments[i];

				plugin.init(mod);

				if (typeof plugin['id'] !== undefined) {
					mod.onPluginLoad(plugin['id']);
				}
			}
			console.log('[InfernoShoutMod] ' + arguments.length + ' plugins loaded.');
		});
	});
});