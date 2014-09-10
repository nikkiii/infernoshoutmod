define(['htmlparser', 'soupselect'], function(HtmlParser, SoupSelect) {
	var vbutil = {};

	if (!String.prototype.stripHtml) {
		String.prototype.stripHtml = function() {
			return this.replace(/(<([^>]+)>)/g, '');
		};
	}

	vbutil.ajaxParams = function() {
		return {
			securitytoken : SECURITYTOKEN
		};
	};

	vbutil.nameCache = {};

	vbutil.findUser = function(name, callback) {
		var found = false;

		name = name.toLowerCase();

		if (name in vbutil.nameCache) {
			var cached = vbutil.nameCache[name];

			callback(cached.id, cached.username);
			return;
		}

		var callCallback = function(id, username) {
			vbutil.nameCache[name] = { id : id, username : username };

			callback(id, username);
		};

		$('#shoutbox_frame > .smallfont').each(function(index) {
			var $a = $(this).children('a:first');

			if ($a.length < 1) {
				return;
			}

			if (name.toLowerCase() == $a.text().toLowerCase()) {
				var id = /pm_(\d+)/.exec(new String($a.get(0).onclick));

				if (id) {
					found = true;
					callCallback(parseInt(id[1]), $a.text());
					return false;
				}
			}
		});

		if (found) {
			return;
		}

		vbutil.findUserByProfile(name, function(id, name) {
			if (id != -1) {
				callCallback(id, name);
			} else {
				callback(-1, '');
			}
		});
	}

	vbutil.findUserByProfile = function(name, callback) {
		$.get(BBURL + '/member.php?do=getinfo&username=' + encodeURIComponent(name), function(res) {
			var match = /var THISUSERID = \s*(\d+);/.exec(res),
				userMatch = /<span class="member_username">(.*)<\/span>/.exec(res);

			if (match && userMatch) {
				callback(parseInt(match[1]), userMatch[1].stripHtml());
			} else {
				console.log('Unable to get user, match:', match, 'user match:', userMatch);
				callback(-1, '');
			}
		});
	};

	vbutil.findUserById = function(id, callback) {
		$.get(BBURL + '/member.php?u=' + id, function(res) {
			var userMatch = /<span class="member_username">(.*)<\/span>/.exec(res);

			if (userMatch) {
				callback(userMatch[1].stripHtml());
			} else {
				callback(false);
			}
		});
	};

	vbutil.addReputation = function(post, reason, direction, callback) {
		var params = {
			ajax : 1,
			do : 'addreputation',
			reputation : direction,
			reason : reason,
			p : post
		};

		$.post(BBURL + '/reputation.php?do=addreputation&p=' + post, params, function(res) {
			var $doc = $(res);

			if ($doc.children('error').length > 0) {
				// Try again!
				callback($doc.children('error').text());
			} else {
				callback(false);
			}
		});
	};

	vbutil.getUsernameHistory = function(userid, callback) {
		$.get(BBURL + '/member.php?u=' + userid, function(data) {
			new HtmlParser.Parser(new HtmlParser.HtmlBuilder(function(err, dom) {
				if (err) {
					callback(err);
				} else {
					var rows = SoupSelect.select(dom, '.historyblock tr');

					var usernames = [];

					rows.slice(1).forEach(function(row) {
						usernames.push(row.children[1].children[0].data);
					});

					callback(false, usernames);
				}
			})).parseComplete(data);
		});
	};

	// TODO redo with SoupSelect
	vbutil.getUserGroups = function(callback) {
		$.get(BBURL + '/profile.php?do=editusergroups', function(res) {
			var groups = {};

			$('input[name=usergroupid]', res).each(function(index) {
				var $this = $(this),
					id = $this.val();

				var element = $this.parent().parent().parent().children('.col1');

				var title = element.text();

				if (element.children('.usergroup').length > 0) {
					title = element.children('.usergroup').text();
				}

				groups[$this.val()] = title;
			});

			callback(groups);
		});
	}

	vbutil.setUserGroup = function(id) {
		var params = $.extend(vbutil.ajaxParams(), {
			do : 'updatedisplaygroup',
			usergroupid : id
		});

		$.post(BBURL + '/profile.php', params, function(data) {
			// Nothing
		});
	};

	vbutil.getSmileyList = function(callback, swapKeys) {
		$.get(BBURL + "/misc.php?do=getsmilies&editorid=vB_Editor_001", function(data) {
			new HtmlParser.Parser(new HtmlParser.HtmlBuilder(function(err, dom) {
				if (err) {
					console.log(err);
				} else {
					var rows = SoupSelect.select(dom, 'ul.smilielist li img');

					var smilies = {};

					rows.forEach(function(res) {
						var data = /src="(.*?)" .* alt="(.*?)"/g.exec(res.raw);

						smilies[data[swapKeys ? 1 : 2]] = data[swapKeys ? 2 : 1];
					});

					callback(smilies);
				}
			})).parseComplete(data);
		});
	};

	var types = {
		'b' : 'b',
		'i' : 'i',
		'u' : 'u',
		'strike' : 's'
	};

	vbutil.htmlToBBCode = function(html, smilies) {
		var $elem = html instanceof jQuery ? html.clone() : $('<div>' + html + '</div>');

		for (var type in types) {
			var replacement = types[type];
			$elem.children(type).each(function(index) {
				var $this = $(this);
				$this.replaceWith('[' + replacement + ']' + $this.html() + '[/' + replacement + ']');
			});
		}

		$elem.children('a').each(function(index) {
			// replacement : [url=#href]#text[/url]
			var $this = $(this),
				href = $this.attr('href'),
				html = $this.html();

			$this.replaceWith(href == html ? '[url]' + href + '[/url]' : '[url=' + href + ']' + html + '[/url]');
		});

		if (smilies) {
			$elem.children('img').each(function(index) {
				var $this = $(this),
					url = $this.attr('src');

				if (url in smilies) {
					$this.replaceWith(smilies[url]);
				} else {
					$this.remove();
				}
			});
		} else {
			$elem.children('img').remove();
		}

		return $elem.text();
	};

	return vbutil;
});