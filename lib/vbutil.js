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

			if (name.toLowerCase() == $a.text().trim().toLowerCase()) {
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
		var params = $.extend(vbutil.ajaxParams(), {
			ajax : 1,
			do : 'addreputation',
			reputation : direction,
			reason : reason,
			p : post
		});

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
			var historyBlock = /<tr>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<\/tr>/g;

			var match, usernames = [];

			while (match = historyBlock.exec(data)) {
				if (usernames.indexOf(match[2]) == -1) {
					usernames.push(match[2]);
				}
			}

			usernames.shift();

			callback(null, usernames);
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

	var smileyCache = false;

	vbutil.getSmileyList = function(callback, swapKeys) {
		if (smileyCache) {
			callback(smileyCache);
			return;
		}
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

					smileyCache = smilies;

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

	var re = /bit_(\d+)_(\d+)$/,
		pidRe = /#post(\d+)/;

	function parseReputation(given, callback) {
		$.get('usercp.php', function(data) {
			var history = [];

			var selector = '#reputationlist';

			if (given) {
				selector = '#reputationgivenlist';
			}

			selector += ' > li';

			$(data).find(selector).each(function() {
				var $this = $(this),
					userId = parseInt(re.exec($this.attr('id'))[2]),
					userInfo = $this.find('.userinfo'),
					itemInfo = $this.find('.iteminfo'),
					titleInfo = itemInfo.find('.title a');

				history.push({
					type: $this.hasClass('neg') ? 'negative' : 'positive',
					userId: userId,
					name: userInfo.find('.user > a').text(),
					postId: parseInt(pidRe.exec(titleInfo.attr('href'))[1]),
					threadName: titleInfo.text(),
					comment : itemInfo.find('.comment').text()
				});
			});

			callback(history);
		});
	}

	vbutil.reputationReceivedHistory = function(callback) {
		parseReputation(false, callback);
	};

	vbutil.reputationGivenHistory = function(callback) {
		parseReputation(true, callback);
	};

	return vbutil;
});