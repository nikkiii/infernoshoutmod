window.InfernoShoutMod = {};

require.config({
	baseUrl : 'http://nikkii.us/sbmod/',
	paths: {
		jquery : 'http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min',
		minivents : 'lib/minivents'
	}
});

var deps = [
	'jquery',
	'modules/mod',
	'modules/commands',
	'modules/tabs'
];

var plugins = [
	'plugins/groupchanger',
	'plugins/quoting',
	'plugins/youtube',
	'plugins/noshadow',
	'plugins/userhistory'
];

require(deps, function($, InfernoShoutMod) {
	var mod = new InfernoShoutMod();
	mod.init();

	console.log('[InfernoShoutMod] Initial loading done.');

	console.log('[InfernoShoutMod] Initializing modules');

	var args = Array.apply([], arguments);
	args = args.slice(2);

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
		}
		console.log('[InfernoShoutMod] ' + arguments.length + ' plugins loaded.');
	});
});