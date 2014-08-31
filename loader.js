window.InfernoShoutMod = {};

require.config({
	baseUrl : 'http://nikkii.us/sbmod/dev/',
	paths: {
		jquery : 'http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min',
		minivents : 'lib/minivents',
		htmlparser : 'lib/htmlparser',
		soupselect : 'lib/soupselect'
	}
});

function loadCss(url) {
	var link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = url;
	document.getElementsByTagName("head")[0].appendChild(link);
}

var deps = [
	'jquery',
	'modules/mod',
	'modules/commands',
	'modules/tabs'
];

var plugins = [
	'plugins/settings',
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

	loadCss('//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css');

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
		mod.plugins = [];
		for(i = 0; i < arguments.length; i++) {
			arguments[i].init(mod);
			mod.plugins.push(plugins[i]);
		}
		console.log('[InfernoShoutMod] ' + arguments.length + ' plugins loaded.');
	});
});