define(['module'], function (module) {
	'use strict';

	return {
		load : function(name, req, onload, config) {
			if (config.isBuild) {
				onload();
				return;
			}
			var link = document.createElement("link");
			link.type = "text/css";
			link.rel = "stylesheet";
			link.href = req.toUrl(name);
			document.getElementsByTagName("head")[0].appendChild(link);

			onload();
		}
	};
});