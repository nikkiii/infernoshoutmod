define(function() {
	var smilies = {
		':bluesclues:' : {
			image : 'http://probablyaserver.com/forums/images/smilies/clues.png',
			alt : 'Blues Clues'
		},
		':coolclues:' : {
			image : 'http://probablyaserver.com/forums/images/smilies/coolclues.png',
			alt : 'Cool Clues'
		},
		':grumpycat:' : {
			image : 'http://probablyaserver.com/forums/images/smilies/grumpycat.png',
			alt : 'Grumpy Cat'
		},
		':coolgrumpy:' : {
			image : 'http://probablyaserver.com/forums/images/smilies/coolgrumpy.png',
			alt : 'Cool Grumpy Cat'
		},
		':cooldoge:' : {
			image : 'http://probablyaserver.com/forums/images/smilies/cooldoge.png',
			alt : 'Cool Doge'
		},
		':coding:' : {
			image : 'http://i.imgur.com/htuHhTi.gif',
			alt : 'coding coding coding coding'
		}
	};

	function generateImageTag(data) {
		return '<img src="' + data.image + '" alt="' + data.alt + '" style="border: 0;" />';
	}

	var SmileyPlugin = function(mod) {
		var enableSmilies = true;

		mod.addSetting('smilies', 'checkbox', function(val) {
			enableSmilies = val;
		});

		mod.on('update_shouts', function(ctx, evt) {
			if (!enableSmilies) {
				return;
			}

			for (var smiley in smilies) {
				if (evt.shoutHtml.indexOf(smiley) !== -1) {
					var data = smilies[smiley];

					evt.shoutHtml = evt.shoutHtml.replace(smiley, generateImageTag(data));
				}
			}
		});
	};

	return {
		id : 'smilies',
		init : SmileyPlugin
	};
});