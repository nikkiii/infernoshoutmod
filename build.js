({
	baseUrl : '.',
	name : 'loader',
	out : './dist/infernoshoutmod.js',
	fileExclusionRegExp : /^(build|infernoshoutmod.user)\.js$/,
	removeCombined : true,
	findNestedDependencies : true,
	optimizeAllPluginResources: true,
	paths: {
		jquery : 'empty:',
		underscore : 'empty:',
		fontawesome : 'empty:',
		noty : 'empty:',
		minivents : 'lib/minivents',
		htmlparser : 'lib/htmlparser',
		soupselect : 'lib/soupselect',
		idb : 'lib/idb',
		vbutil : 'lib/vbutil',

		text : './text',
		css : './css'
	}
})