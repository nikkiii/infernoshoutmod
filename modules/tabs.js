define(['./mod'], function(InfernoShoutMod) {

	InfernoShoutMod.prototype.addTab = function(id, title, content, closeable) {
		this.tabs || (this.tabs = {})
		closeable || (closeable = false);

		InfernoShoutbox.append_tab('<a id="InfernoShoutMod-Tab-' + id + '" href="?" onclick="return InfernoShoutbox.show(\'' + id + '\');">' + title + '</a>');
		this.tabs[id] = { title : title, content : content };
	};

	InfernoShoutMod.prototype.addStaticTab = function(id, title, content) {
		this.staticTabs || (this.staticTabs = {})

		InfernoShoutbox.append_tab('<a id="InfernoShoutMod-Tab-' + id + '" href="?" onclick="return InfernoShoutbox.show(\'' + id + '\');">' + title + '</a>');

		var $new = $('#shoutbox_content_frame').clone();
		$new.attr('id', 'infernoshoutmod_tab_content_' + id);
		$new.html('<div id="content_box">' + content + '</div>');
		$new.hide();
		$new.appendTo($('#shoutbox_window'));

		this.staticTabs[id] = { title : title };
	};

	InfernoShoutMod.prototype.removeTab = function(id) {
		if (this.staticTabs[id]) {
			$('#infernoshoutmod_tab_content_' + id).remove();
			delete this.staticTabs[id];
		} else if (this.tabs[id]) {
			delete this.tabs[id];
		}
		InfernoShoutbox.close_tab($('#InfernoShoutMod-Tab-' + id).get());
	};

	var TabModuleInit = function(mod) {
		InfernoShoutbox.show = function (what) {
			if (what == this.showing) {
				return false;
			}
			this.showing = what;
			if (what == 'shoutbox') {
				$('#shoutbox_window > span').hide();
				this.goto_pm_window('shoutbox_frame');
				this.shoutframe.style.display = 'block';
			} else if (what == 'activeusers') {
				$('#shoutbox_window > span').hide();
				this.fetch_users();
				this.userframe.innerHTML = "<div id=\'users\'></div>";
				this.userframe.style.display = 'block';
			} else if (what in oc(this.titles)) {
				$('#shoutbox_window > span').hide();
				this.fetch_content();
				this.contentframe.innerHTML = "<div id=\'content_box\'></div>";
				this.contentframe.style.display = 'block';
			} else if (mod.tabs && what in mod.tabs) {
				$('#shoutbox_window > span').hide();
				// Internal tabs
				$(this.contentframe)
					.html("<div id=\'content_box\'>" + mod.tabs[what].content + "</div>")
					.css('display', 'block');
			} else if (mod.staticTabs && what in mod.staticTabs) {
				$('#shoutbox_window > span').hide();

				$('#infernoshoutmod_tab_content_' + what).css('display', 'block');
			}
			return false;
		};
	};

	return {
		init : TabModuleInit
	};
});