define(['vbutil'], function(vbutil) {
	var ID_REGEXP = new RegExp(/pm_(\d+)/),
		shoutIdRegex = new RegExp(/edit_shout\((\d+)\)/);

	var ShoutFunctionPlugin = function(mod) {
		var hoverIndex = -1,
			profileElement = $('<span class="profilelink"> <a href="#"><i class="fa fa-user"></i></a></span>'),
			quoteElement = $('<span class="quote"> <a href="#"><i class="fa fa-comment-o"></i></a></span>'),
			deleteElement = $('<span class="delete"> <a href="#"><i class="fa fa-trash"></i></a></span>'),
			ignoreElement = $('<span class="ignore"> <a href="#"><i class="fa fa-ban"></i></a></span>');

		var promptDelete = true;

		mod.on('update_shouts_post', function(shouts) {
			if (hoverIndex != -1) {
				$('#shoutbox_frame > .smallfont:nth-child(' + hoverIndex + ')').each(function(index) {
					$(this).append(profileElement).append(quoteElement).append(this.ondblclick ? deleteElement : ignoreElement);
				});
			}
		});

		$('#shoutbox_frame').on('mouseenter', 'div.smallfont:not(:first)', function() {
			var $this = $(this);

			if ($this.children('.quote').length > 0) {
				return;
			}

			hoverIndex = $this.index() + 1;

			$this.append(profileElement).append(quoteElement).append(this.ondblclick ? deleteElement : ignoreElement);
		});

		$('#shoutbox_frame').on('mouseleave', 'div.smallfont:not(:first)', function() {
			$(this).children('.profilelink, .quote, .delete, .ignore').remove();

			hoverIndex = -1;
		});

		$('#shoutbox_frame').on('click', 'div.smallfont > .profilelink > a', function(e) {
			e.preventDefault();

			var $this = $(this);

			var id = ID_REGEXP.exec($this.closest('.smallfont').html());

			if (!id) {
				return;
			}

			id = id[1];

			var base = window.location.href.substring(0, window.location.href.lastIndexOf('/'));

			var w = window.open(base + '/member.php?u=' + id);
			w.focus();
		});

		var smilies = false;

		vbutil.getSmileyList(function(list) {
			smilies = list;
		}, true);

		var includeBBCode = true;

		mod.addSetting('quote-bbcode', 'checkbox', function(res) {
			includeBBCode = res;
		});

		$('#shoutbox_frame').on('click', 'div.smallfont > .quote > a', function(e) {
			e.preventDefault();

			var $elem = $(this).closest('.smallfont');

			if (includeBBCode) {
				$elem = $elem.clone();

				var $time = $elem.children('.time');

				// Get rid of those pesky mod buttons
				$time.prevAll('a').remove();

				$time.replaceWith($time.text());

				// Replace the name with text
				var $name = $elem.children('a:first');
				$name.replaceWith($name.text());

				$elem.children('.profilelink, .quote, .delete, .ignore').remove();
			}

			InfernoShoutbox.editor.value = PHP.trim(includeBBCode ? vbutil.htmlToBBCode($elem, smilies) : $elem.text());
		});

		$('#shoutbox_frame').on('click', 'div.smallfont > .delete > a', function(e) {
			e.preventDefault();

			var row = $(this).closest('.smallfont').get(0);

			if (!row || !row.ondblclick) {
				return;
			}

			var dblclick = new String(row.ondblclick);

			var confirmation = !promptDelete || confirm('Delete this shout?');

			if (!confirmation) {
				return;
			}

			var id = shoutIdRegex.exec(dblclick);
			id = id[1];

			InfernoShoutbox.postDeleteShout(id);
		});

		$('#shoutbox_frame').on('click', 'div.smallfont > .ignore > a', function(e) {
			e.preventDefault();

			var $this = $(this);

			var id = ID_REGEXP.exec($this.closest('.smallfont').html());

			if (!id) {
				return;
			}

			id = id[1];

			var confirmation = confirm('Ignore ' + PHP.trim($this.closest('.smallfont').children('a:first').text()) + '?');

			if (!confirmation) {
				return;
			}

			mod.handleCommand('ignoreid ' + id);
		});

		mod.addSetting('promptdelete', 'checkbox', function(val) {
			promptDelete = val;
		});
	};

	return {
		id : 'shoutfunctions',
		init: ShoutFunctionPlugin
	};
});