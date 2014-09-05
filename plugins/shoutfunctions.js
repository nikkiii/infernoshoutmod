define(function() {
	var ShoutFunctionPlugin = function(mod) {
		var hoverIndex = -1,
			quoteElement = $('<span class="quote"> <a href="#"><i class="fa fa-comment-o"></i></a></span>'),
			deleteElement = $('<span class="delete"> <a href="#"><i class="fa fa-trash"></i></a></span>'),
			ignoreElement = $('<span class="ignore"> <a href="#"><i class="fa fa-ban"></i></a></span>');

		var promptDelete = true;

		mod.on('update_shouts', function(shouts) {
			if (hoverIndex != -1) {
				$('#shoutbox_frame > .smallfont:nth-child(' + hoverIndex + ')').each(function(index) {
					$(this).append(quoteElement);

					if (this.ondblclick) {
						$(this).append(deleteElement);
					} else {
						$(this).append(ignoreElement);
					}
				});
			}
		});

		$('#shoutbox_frame').on('mouseenter', 'div.smallfont:not(:first)', function() {
			if ($(this).children('.quote').length > 0) {
				return;
			}

			hoverIndex = $(this).index() + 1;

			$(this).append(quoteElement);

			if (this.ondblclick) {
				$(this).append(deleteElement);
			} else {
				$(this).append(ignoreElement);
			}
		});

		$('#shoutbox_frame').on('mouseleave', 'div.smallfont:not(:first)', function() {
			hoverIndex = -1;
			$(this).children('.quote').remove();
			$(this).children('.delete').remove();
			$(this).children('.ignore').remove();
		});

		$('#shoutbox_frame').on('click', 'div.smallfont > .quote > a', function(e) {
			e.preventDefault();

			InfernoShoutbox.editor.value = PHP.trim($(this).closest('.smallfont').text());
		});

		var shoutIdRegex = new RegExp(/edit_shout\((\d+)\)/);
		$('#shoutbox_frame').on('click', 'div.smallfont > .delete > a', function(e) {
			e.preventDefault();

			var row = $(this).closest('.smallfont').get(0);

			if (!row || !row.ondblclick) {
				return;
			}

			var dblclick = new String(row.ondblclick);

			var confirmation = !promptDelete || confirm('Delete this shout?');

			if (confirmation) {
				var id = shoutIdRegex.exec(dblclick);
				id = id[1];

				InfernoShoutbox.postDeleteShout(id);
			}
		});

		var ID_REGEXP = new RegExp(/pm_(\d+)/);
		$('#shoutbox_frame').on('click', 'div.smallfont > .ignore > a', function(e) {
			e.preventDefault();

			var id = ID_REGEXP.exec($(this).closest('.smallfont').html());

			if (!id) {
				return;
			}

			id = id[1];

			var confirmation = confirm('Ignore user ' + id + '?');

			if (!confirmation) {
				return;
			}

			mod.handleCommand('ignore ' + id);
		});

		mod.addSetting('promptdelete', 'checkbox', function(val) {
			promptDelete = val;
		});
	};

	return {
		init: ShoutFunctionPlugin
	};
});