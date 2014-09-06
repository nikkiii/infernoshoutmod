window.InfernoShoutMod = {};

require.config({
	baseUrl : 'http://nikkii.us/sbmod/',
	paths: {
		jquery : 'http://cdn.probablyaserver.com/libs/jquery/2.1.1/jquery.min',
		underscore : 'http://cdn.probablyaserver.com/libs/underscore/1.7.0/underscore.min',
		fontawesome : 'http://cdn.probablyaserver.com/libs/font-awesome/4.2.0/css/font-awesome.min.css',
		minivents : 'lib/minivents',
		htmlparser : 'lib/htmlparser',
		soupselect : 'lib/soupselect',
		idb : 'lib/idb'
	}
});

var deps = [
	'jquery',
	'css!fontawesome'
];

var modules = [
	'modules/mod',
	'modules/commands',
	'modules/tabs',
	'modules/settings'
];

var plugins = [
	'plugins/groupchanger',
	'plugins/ignores',
	'plugins/shoutfunctions',
	'plugins/shoutreplace',
	'plugins/youtube',
	'plugins/noshadow',
	'plugins/userhistory',
	'plugins/shortcuts',
	'plugins/customloader' // Load custom plugins last
];

require(deps, function($) {
	require(modules, function(InfernoShoutMod) {
		console.log('[InfernoShoutMod] Initial loading done.');

		var mod = new InfernoShoutMod();
		mod.init();

		console.log('[InfernoShoutMod] Initializing modules');

		var args = Array.apply([], arguments);
		args = args.slice(1);

		var i;
		for (i = 0; i < args.length; i++) {
			if (typeof args[i] !== 'undefined' && typeof args[i]['init'] !== 'undefined') {
				args[i].init(mod);
			}
		}

		require(plugins, function() {
			var i;
			for(i = 0; i < arguments.length; i++) {
				arguments[i].init(mod);
				mod.onPluginLoad(plugins[i]);
			}
			console.log('[InfernoShoutMod] ' + arguments.length + ' plugins loaded.');
		});
	});
});