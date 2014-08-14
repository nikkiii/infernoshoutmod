define(['./mod'], function(InfernoShoutMod) {

	InfernoShoutMod.prototype.addTab = function(id, title, content, closeable) {
		this.tabs || (this.tabs = {})
		closeable || (closeable = false);

		InfernoShoutbox.append_tab('<a id="InfernoShoutMod-Tab-' + id + '" href="?" onclick="return InfernoShoutbox.show(\'' + id + '\');">' + title + '</a>');
		this.tabs[id] = { title : title, content : content };
	};

	InfernoShoutMod.prototype.removeTab = function(id) {
		InfernoShoutbox.close_tab($('#InfernoShoutMod-Tab-' + id).get());
		delete this.tabs[id];
	};

	var TabModuleInit = function(mod) {
		InfernoShoutbox.show = function (what) {
			if (what == this.showing) {
				return false;
			}
			this.showing = what;
			if (what == 'shoutbox') {
				this.goto_pm_window('shoutbox_frame');
				this.shoutframe.style.display = 'block';
				this.userframe.style.display = 'none';
				this.contentframe.style.display = 'none';
			} else if (what == 'activeusers') {
				this.fetch_users();
				this.userframe.innerHTML = "<div id=\'users\'></div>";
				this.userframe.style.display = 'block';
				this.shoutframe.style.display = 'none';
				this.contentframe.style.display = 'none';
			} else if (what in oc(this.titles)) {
				this.fetch_content();
				this.contentframe.innerHTML = "<div id=\'content_box\'></div>";
				this.contentframe.style.display = 'block';
				this.userframe.style.display = 'none';
				this.shoutframe.style.display = 'none';
			} else if (what in mod.tabs) {
				// Internal tabs
				$(this.contentframe)
					.html("<div id=\'content_box\'>" + mod.tabs[what].content + "</div>")
					.css('display', 'block');
				this.userframe.style.display = 'none';
				this.shoutframe.style.display = 'none';
			}
			return false;
		};
	};

	return {
		init : TabModuleInit
	};
});