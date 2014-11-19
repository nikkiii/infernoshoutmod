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

	var emotes = {
		"<choir>": "\u30FD(\u30FD(\uFF9F\u30FD(\uFF9F\u2200\u30FD(\uFF9F\u2200\uFF9F\u30FD(\uFF9F\u2200\uFF9F)\uFF89\uFF9F\u2200\uFF9F)\uFF89\u2200\uFF9F)\uFF89\uFF9F)\uFF89)\uFF89",
		"<u>": "_/(\u00B0\u00AFo)\\_",
		"<yun>": "\u10DA(\u0CA0\u76CA\u0CA0\u10DA)",
		"<d>": "\u00AF\\(\u00B0_o)/\u00AF",
		"<butterfly>": "\u01B8\u0335\u0321\u04DC\u0335\u0328\u0304\u01B7",
		"<shrug>": "\u00AF\\\\_(\u30C4)_/\u00AF",
		"<:3>": "(\u30FB\u03C9\u30FB\uFF40 )\uFEFF",
		"<flip>": "(\u30CE\u0CA0\u76CA\u0CA0)\u30CE\u5F61\u253B\u2501\u253B",
		"<unflip>": "\u252C\u2500\u2500\u252C\u25E1\uFF89(\u00B0 -\u00B0\uFF89)",
		"<slide>": "(Woooo)> \u2282\uFF08\uFF9F\u0414\uFF9F[u]\u2282\u2312\uFF40\u3064[/u]\u2261\u2261\u2261\u2261\u2261\u2261",
		"<angry>": "(\u256C \u0CA0\u76CA\u0CA0)",
		"<frd>": "(\u256F\u00B0O\u00B0\uFF09\u256FFUS RO DAH! ==== \u253B\u2501\u253B",
		"<isee>": " (\u261E\uFF9F\u2200\uFF9F)\u261E I see wut u did thar!",
		"<s>": "\u0CA0\u256D\u256E\u0CA0",
		"<d>": "\u00AF\\(\u00B0_o)/\u00AF",
		"<f>": "\u00AF\\_(\u30C4)_/\u00AF",
		"<g>": "\u0CA0_\u0CA0",
		"<bang>": "\\'\u033F\\'\u0335\u0347\u033F\u033F\u0437=\u0E3F\u20B3\u20A6\u20B2 \u0E3F\u20B3\u20A6\u20B2=\u03B5/\u0335\u0347\u033F\u033F/\u2019\u033F\u2019\u033F",
		"<j>": "\u10DA(\u0CA0\u76CA\u0CA0\u10DA)"
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

					if (!data.regexp) {
						data.regexp = new RegExp(smiley, 'g');
					}

					var replacement = smiley;

					if (data.image) {
						replacement = generateImageTag(data);
					} else if (data.text) {
						replacement = data.text;
					}

					evt.shoutHtml = evt.shoutHtml.replace(data.regexp, replacement);
				}
			}
		});

		mod.on('shout', function(ctx, evt) {
			for (var emote in emotes) {
				if (evt.message.indexOf(emote) !== -1) {
					evt.message = evt.message.replace(new RegExp(emote, 'g'), emotes[emote]);
				}
			}
		});
	};

	return {
		id : 'smilies',
		init : SmileyPlugin
	};
});