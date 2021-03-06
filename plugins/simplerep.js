define(['htmlparser', 'soupselect', 'vbutil', 'config', 'noty'], function(HtmlParser, SoupSelect, vbutil, config) {
	var SimpleRepPlugin = function(mod) {
		function findPosts(userid, callback) {
			$.get('search.php?do=finduser&userid=' + userid + '&contenttype=vBForum_Post&showposts=1', function(data) {
				var re = /div id="post_message_(\d+)"/g;

				var match;

				var posts = [];

				while (match = re.exec(data)) {
					posts.push(parseInt(match[1]));
				}

				callback(posts);
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
				comment = args.length > 0 ? args.join(' ') : 'Reputation from InfernoShoutMod',
				neg = cmd == 'neg' ? true : false;

			vbutil.findUser(user, function(userId, name) {
				if (userId != -1) {
					var confirmation = confirm('Are you sure you wish to ' + (neg ? 'deduct reputation from' : 'add reputation to') + ' ' + name + '?');

					if (!confirmation) {
						return;
					}

					findPosts(userId, function(posts) {
						recursiveReputation(posts, comment, neg ? 'neg' : 'pos', function(err) {
							if (!err) {
								noty({ text : 'Successfully ' + (neg ? 'deducted reputation from' : 'added reputation to') + ' ' + name + '.', type : 'success', timeout : 5000 });
							} else {
								if (err.indexOf('You must spread') !== -1) {
									// See how long until we can give them reputation again.
									vbutil.reputationGivenHistory(function(history) {
										var i = 0;
										for (; i < history.length; i++) {
											if (history[i].userId == userId) {
												break;
											}
										}

										// FIXME: 15 is unique to the forum I visit frequently.
										noty({ text : 'Unable to ' + (neg ? 'deduct reputation from' : 'add reputation to') + ' ' + name + ', you will be able to after spreading reputation to ' + (config.reputation.limit - i) + ' people.', type : 'error', timeout : 5000 });
									});
								} else {
									noty({ text : 'Unable to ' + (neg ? 'deduct reputation from' : 'add reputation to') + ' ' + name + ', reason: ' + err, type : 'error', timeout : 5000 });
								}
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
		id : 'simplerep',
		init : SimpleRepPlugin
	};
});