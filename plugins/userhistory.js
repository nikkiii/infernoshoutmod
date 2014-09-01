// Username History Plugin
// Based off code by Major and Klepto
define(['htmlparser', 'soupselect'], function(HtmlParser, SoupSelect) {
	var UsernameHistoryPlugin = function(mod) {
		var FontWeight = {
			NORMAL: {},
			BOLD: {}
		};

		// Gets the width of the string; assumes a 12px arial font. XYZA
		String.prototype.width = function(bold) {
			var element = $('<div>' + this + '</div>')
				.css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': '12px arial', 'font-weight': bold == FontWeight.BOLD ? 'bold' : 'normal'})
				.appendTo($('body'));
			var width = element.width();

			element.remove();
			return width;
		}


		var NO_PREVIOUS_NAMES = "No previous names.";
		var NO_PREVIOUS_NAMES_WIDTH = NO_PREVIOUS_NAMES.width(FontWeight.NORMAL);

		var NAME_LIST_PREFIX = "<b>Previous names:</b>";
		var NAME_LIST_PREFIX_WIDTH = NAME_LIST_PREFIX.width(FontWeight.BOLD);

		var ID_REGEXP = new RegExp(/pm_(\d+)/);

		$('#shoutbox_frame').on('mouseenter ', 'div > a[href=#]', function() {
			if (!this.onclick) {
				return;
			}

			var matches = ID_REGEXP.exec(new String(this.onclick));

			var id = matches[1];

			setUsernameTooltip(id, $(this));
			$("#previousUsername").offset({ top: $(this).offset().top + 10, left: $(this).offset().left + 60});
		});

		$('#shoutbox_frame').on('mouseout', 'div > a[href=#]', function() {
			$("#previousUsername").hide();
		});

		// Wrapper for the tab width and html.
		function User(width, html) {
			this.width = width;
			this.html = html;
		}


		var cachedUsernames = [], loadingUsernames = [];
		var loading = -1;

		var setUsernameTooltip = function(id, link) {
			var tab = $("#previousUsername");
			tab.show();

			if (cachedUsernames[id] != null) {
				var user = cachedUsernames[id];
				tab.width(user.width);
				tab.html(user.html);
			} else if (loadingUsernames.indexOf(id) == -1) {
				loading = id;
				tab.text("Loading...");
				tab.width(55);

				loadingUsernames.push(id);

				$.get("/member.php?u=" + id, function(data) {
					var usernames = "", width = NAME_LIST_PREFIX_WIDTH;

					var handler = new HtmlParser.HtmlBuilder(function(err, dom) {
						if (err) {
							console.log(err);
						} else {
							var rows = SoupSelect.select(dom, '.historyblock tr');

							rows.slice(1).forEach(function(row) {
								var username = row.children[1].children[0].data, usernameWidth = username.width();
								if (usernameWidth >= width) {
									width = usernameWidth;
								}
								usernames += "<li>" + username + "</li>";
							});

							width = (usernames != "" ? NO_PREVIOUS_NAMES_WIDTH : width) + 5;
							tab.width(width);

							usernames = !usernames ? "<li>No previous names.</li>" : NAME_LIST_PREFIX + usernames;
							cachedUsernames[id] = new User(width, usernames);

							if (loading == id) {
								tab.html(usernames);
							}

							for (var i = 0; i < loadingUsernames.length; i++) {
								if (loadingUsernames[i] == id) {
									delete loadingUsernames[i];
									break;
								}
							}
						}
					});

					var parser = new HtmlParser.Parser(handler);
					parser.parseComplete(data);
				});
			}
		};

		$('body').append("<ul id='previousUsername' style='width:55px;background:#222;padding:2px;padding-left:5px;padding-right:5px;border:#CCC 1px solid;color:#CCC;'></ul>");
		$("#previousUsername").hide();
	};

	return {
		init: UsernameHistoryPlugin
	};
});