window.InfernoShoutMod = {};

require.config({
	baseUrl : 'http://nikkii.us/sbmod/',
	paths: {
		jquery : 'http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min',
		minivents : 'lib/minivents'
	}
});

require(['jquery', 'modules/mod', 'modules/commands'], function($, InfernoShoutMod) {
	var mod = new InfernoShoutMod();
	mod.init();

	console.log('[InfernoShoutMod] Initial loading done.');

	require(['plugins/groupchanger', 'plugins/quoting', 'plugins/youtube', 'plugins/noshadow'], function() {
		var i;
		for(i = 0; i < arguments.length; i++) {
			arguments[i].init(mod);
		}
		console.log('[InfernoShoutMod] ' + arguments.length + ' plugins loaded.');
	});
});