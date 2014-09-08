define(['htmlparser', 'soupselect', 'vbutil', 'noty'], function(HtmlParser, SoupSelect, vbutil) {
	var SimpleRepPlugin = function(mod) {
		function findPosts(userid, callback) {
			$.get('search.php?do=finduser&userid=' + userid + '&contenttype=vBForum_Post&showposts=1', function(data) {
				new HtmlParser.Parser(new HtmlParser.HtmlBuilder(function(err, dom) {
					if (err) {
						console.log(err);
					} else {
						var rows = SoupSelect.select(dom, '[id^=post_message_]');

						var i, posts = [];

						for (i = 0; i < rows.length; i++) {
							var row = rows[i];

							if ('id' in row.attributes) {
								posts.push(parseInt(row.attributes.id.substring(row.attributes.id.lastIndexOf('_')+1)));
							}
						}

						callback(posts);
					}
				})).parseComplete(data);
			});
		}

		function recursiveReputation(posts, comment, direction, callback) {
			if (posts.length < 1) {
				callback('Unable to find a useful post.');
				return;
			}

			var postId = posts.shift();
			vbutil.addReputation(postId, comment, direction, function(err, success) {
				if (err) {
					if (err.indexOf('spread') !== -1 || err.indexOf('too much') !== -1) {
						callback(err);
						return;
					}
					recursiveReputation(posts, comment, direction, callback);
				} else {
					callback(false);
				}
			});
		}

		var RepCommandHandler = function(cmd, args) {
			if (args.length < 1) {
				return;
			}

			var user = args.shift(),
				comment = args.length > 1 ? args.join(' ') : 'Reputation from InfernoShoutMod',
				neg = cmd == 'neg' ? true : false;

			vbutil.findUser(user, function(userId, name) {
				if (userId != -1) {
					findPosts(userId, function(posts) {
						recursiveReputation(posts, comment, neg ? 'neg' : 'pos', function(err) {
							if (!err) {
								noty({ text : 'Successfully ' + (neg ? 'deducted reputation from' : 'added reputation to') + ' ' + name + '.', type : 'success', timeout : 5000 });
							} else {
								noty({ text : 'Unable to ' + (neg ? 'deduct reputation from' : 'add reputation to') + ' ' + name + ', reason: ' + err, type : 'error', timeout : 5000 });
							}
						});
					});
				} else {
					noty({ text : 'Unable to find user ' + user, type : 'error', timeout : 5000 });
				}
			});
		};

		mod.registerCommand('rep', RepCommandHandler);
		mod.registerCommand('neg', RepCommandHandler);
	};

	return {
		init : SimpleRepPlugin
	};
});