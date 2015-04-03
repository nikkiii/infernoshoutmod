define(['datejs'], function() {
	return {
		parseQueryString: function(query) {
			var out = {};
			var vars = query.split('&');
			for (var i = 0; i < vars.length; i++) {
				var key = decodeURIComponent(vars[i].substring(0, vars[i].indexOf('=')));
				var value = decodeURIComponent(vars[i].substring(vars[i].indexOf('=') + 1))

				out[key] = value;
			}
			return out;
		},
		filterTitle: function(title, decapitalize) {
			var replaced = title.replace(new RegExp("[\\(\\[][a-zA-Z ]+[\\)\\]]", "g"), ""); // |((L|l)yrics)
			var parts = replaced.split(" ");

			if (decapitalize) {
				for (var i = 0; i < parts.length; i++) {
					var part = parts[i];
					parts[i] = part.charAt(0).toUpperCase() + part.substring(1).toLowerCase();
				}
			}

			replaced = parts.join(" ");
			return replaced.trim();
		},
		parseURL : function(url) {
			var parser = document.createElement('a'),
				searchObject = {},
				queries, split, i;

			// Let the browser do the work
			parser.href = url;

			// Convert query string to object
			queries = parser.search.replace(/^\?/, '').split('&');
			for( i = 0; i < queries.length; i++ ) {
				split = queries[i].split('=');
				searchObject[split[0]] = split[1];
			}

			return {
				protocol: parser.protocol,
				host: parser.host,
				hostname: parser.hostname,
				port: parser.port,
				pathname: parser.pathname,
				queryString: parser.search,
				queryObject: searchObject,
				hash: parser.hash
			};
		},
		secondsToHMS: function(time) {
			// Minutes and seconds
			var mins = ~~(time / 60);
			var secs = time % 60;

			// Hours, minutes and seconds
			var hrs = ~~(time / 3600);
			var mins = ~~((time % 3600) / 60);
			var secs = time % 60;

			// Output like "1:01" or "4:03:59" or "123:03:59"
			ret = "";

			if (hrs > 0)
				ret += "" + hrs + ":" + (mins < 10 ? "0" : "");

			ret += "" + mins + ":" + (secs < 10 ? "0" : "");
			ret += "" + secs;
			return ret;
		},
		shoutTimestamp: function(date) {
			var today = Date.parse('t');
			var yesterday = Date.parse('yesterday');

			var pre = '';

			if (date.compareTo(today) > 0) {
				pre = 'Today';
			} else if (date.between(yesterday, today)) {
				pre = 'Yesterday';
			} else {
				pre = date.toString('MM/dd/yy');
			}

			return pre + ' ' + date.toString("hh:mm")
		}
	}
});