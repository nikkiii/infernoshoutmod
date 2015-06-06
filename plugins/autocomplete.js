define([], function() {
	var AutoCompletePlugin = function(mod) {
		// Register tab handler for jQuery
		$.fn.extend({
			// Let the element use the tab instead of skipping it
			catchTab: function(callback) {
				$(this).keydown(function(e) {
					if (e.which == 9) {
						if (callback) {
							callback.apply(this);
						}
						return false;
					}
				});

				// For Opera, which only allows suppression of keypress events, not keydown
				$(this).keypress(function(e) {
					if (e.which == 9) {
						return false;
					}
				});
			}
		});

		function activeNames() {
			var names = [];
			$('#shoutbox_frame').children('div.smallfont').each(function() {
				var $child = $(this).children('a:first');
				if ($child.length < 1) {
					return;
				}
				names.push($child.text().trim());
			});

			// Search users frame if we have anything.
			$('#shoutbox_users_frame').find('a').each(function() {
				names.push($(this).text().trim());
			});
			return $.unique(names);
		}

		// takes a text field and an array of strings for autocompletion
		function autocomplete(input, data) {
			if (input.value.length == input.selectionStart && input.value.length == input.selectionEnd) {
				var search = input.value;
				if (search.lastIndexOf(' ') !== -1) {
					search = search.substring(search.lastIndexOf(' ') + 1);
				}
				search = search.toLowerCase();

				var candidates = [];
				// filter data to find only strings that start with existing value
				for (var i=0; i < data.length; i++) {
					if (data[i].toLowerCase().indexOf(search) == 0 && data[i].length > search.length)
						candidates.push(data[i]);
				}

				if (candidates.length > 0) {
					// some candidates for autocompletion are found
					var value = input.value.substring(0, input.value.length - search.length);
					if (candidates.length == 1)
						input.value = value + candidates[0];
					else
						input.value = value + longestInCommon(candidates, search.length);
					return true;
				}
			}
			return false;
		}

		// finds the longest common substring in the given data set.
		// takes an array of strings and a starting index
		function longestInCommon(candidates, index) {
			var i, ch, memo
			do {
				memo = null
				for (i=0; i < candidates.length; i++) {
					ch = candidates[i].charAt(index)
					if (!ch) break
					if (!memo) memo = ch
					else if (ch != memo) break
				}
			} while (i == candidates.length && ++index)

			return candidates[0].slice(0, index)
		}

		$('#vbshout_pro_shoutbox_editor').catchTab(function() {
			autocomplete(this, activeNames());
		});
	};

	return {
		id: 'autocomplete',
		init: AutoCompletePlugin
	};
});