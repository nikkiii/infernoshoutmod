define(function() {
	return {
		init: function(mod) {
			// jQuery for frontend
			$('#infernoshoutmod-plugin-add').click(function(e) {
				e.preventDefault();
				var url = $('#infernoshoutmod-plugin-url').val();
				var $li = $('<li />');
				$li.html(url.substring(url.lastIndexOf('/') + 1) + ' <a id="infernoshoutmod-plugin-remove" href="#"><i class="fa fa-times"></i></a>');
				$li.data('url', url);
				$li.appendTo($('#infernoshoutmod-setting-plugins'));
				$('#infernoshoutmod-setting-plugins').trigger('change');
				$('#infernoshoutmod-plugin-url').val('');
			});
			$(document).on('click', '#infernoshoutmod-plugin-remove', function(e) {
				e.preventDefault();
				var $elem = $(this).parent();
				$elem.remove();
				$('#infernoshoutmod-setting-plugins').trigger('change');
				alert('Plugin removed.');
				location.reload();
			});
			$(document).on('click', '#infernoshoutmod-ignore-remove', function(e) {
				e.preventDefault();

				var $elem = $(this).parent();
				$elem.remove();

				$('#infernoshoutmod-setting-ignored-users').trigger('change');
			});
		}
	}
});