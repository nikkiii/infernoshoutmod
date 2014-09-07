define(['htmlparser', 'soupselect'], function(HtmlParser, SoupSelect) {
	var vbutil = {};

	var USER_REGEX = /var THISUSERID = \s*(\d+);/;
	var USER_NAME_REGEX = /<span class="member_username">(.*)<\/span>/gi;

	vbutil.findUser = function(name, callback) {
		$.get('member.php?do=getinfo&username=' + encodeURIComponent(name), function(res) {
			var match = USER_REGEX.exec(res), userMatch = USER_NAME_REGEX.exec(res);

			if (match && userMatch) {
				callback(parseInt(match[1]), userMatch[1].replace(/(<([^>]+)>)/ig, ''));
			} else {
				callback(-1, '');
			}
		});
	};

	vbutil.findUserById = function(id, callback) {
		$.get('member.php?u=' + id, function(res) {
			var userMatch = USER_NAME_REGEX.exec(res);

			if (userMatch) {
				callback(userMatch[1].replace(/(<([^>]+)>)/ig, ''));
			} else {
				callback(false);
			}
		});
	};

	vbutil.addReputation = function(post, reason, direction, callback) {
		var params = {
			ajax : 1,
			securitytoken : SECURITYTOKEN,
			do : 'addreputation',
			reputation : direction,
			reason : reason,
			p : post
		};

		$.post('reputation.php?do=addreputation&p=' + post, params, function(res) {
			// Test response?
			console.log(res);

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
		$.get("/member.php?u=" + userid, function(data) {
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

	return vbutil;
});