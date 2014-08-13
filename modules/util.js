define(function() {
	return {
		parseQueryString : function(query) {
			var out = {};
			var vars = query.split('&');
			for (var i = 0; i < vars.length; i++) {
				var key = decodeURIComponent(vars[i].substring(0, vars[i].indexOf('=')));
				var value = decodeURIComponent(vars[i].substring(vars[i].indexOf('=') + 1))

				out[key] = value;
			}
			return out;
		},
		filterTitle : function(title) {
			var replaced = title.replace(new RegExp("[\\(\\[][a-zA-Z ]+[\\)\\]]", "g"), ""); // |((L|l)yrics)
			var parts = replaced.split(" ");

			for (var i = 0; i < parts.length; i++) {
				var part = parts[i];
				parts[i] = part.charAt(0).toUpperCase() + part.substring(1).toLowerCase();
			}

			replaced = parts.join(" ");
			return replaced.trim();
		}
	}
});