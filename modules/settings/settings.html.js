define(function() {
	var html = '<h2><a href="http://www.rune-server.org/programming/website-development/projects/564248-infernoshoutmod.html">InfernoShoutMod</a></h2>';
	html += '<br />';
	html += '<label><input id="infernoshoutmod-setting-idle" type="checkbox" checked="checked" /> Allow Idle Timeout</label><br />';
	html += '<label><input id="infernoshoutmod-setting-effects" type="checkbox" /> Allow Username Effects</label><br />';
	html += '<label><input id="infernoshoutmod-setting-promptdelete" type="checkbox" checked="checked" /> Prompt before deleting shouts</label><br />';
	html += '<label><input id="infernoshoutmod-setting-quote-bbcode" type="checkbox" checked="checked" /> Quote bbcode and smilies</label><br />';

	html += '<br /><h2>Ignored Users</h2>';
	html += '<ul id="infernoshoutmod-setting-ignored-users"></ul>';

	html += '<br /><h2>Plugins</h2>';
	html += '<ul id="infernoshoutmod-setting-plugins"></ul>';
	html += '<br /><br /><input id="infernoshoutmod-plugin-url" type="text" placeholder="Plugin URL" /> <input id="infernoshoutmod-plugin-add" type="button" value="Add" />';
	return html;
});