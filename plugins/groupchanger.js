define(function() {
	var GroupChangerPlugin = function(mod) {
		var usergroups = {
			'member' : 2,
			'appellate' : 5,
			'administrator' : 6,
			'moderator' : 7,
			'donator' : 16,
			'veteran' : 22,
			'designer' : 30,
			'sotw' : 54,
			'programmer' : 63,
			'respected' : 69,
			'superdonator' : 59,
			'extremedonator' : 60,
			'extremedonator#' : 64,
			'middleman' : 70,
			'assistant' : 72
		};

		for (var x in usergroups) {
			mod.registerCommand(x, function(command, args) {
				InfernoShoutbox.setUserGroup(usergroups[command]);
			});
		}

		$.get('/profile.php?do=editusergroups', function(res) {
			$('input[name=usergroupid]', res).each(function(index) {
				var id = $(this).val();

				var element = $(this).parent().parent().parent().children('.col1');

				var title = element.text();

				if (element.children('.usergroup').length > 0) {
					title = element.children('.usergroup').text();
				}
				console.log("Group " + $(this).val() + " - " + title);
			});
		});
	};

	return {
		init : GroupChangerPlugin
	};
});