module.exports = {
	groups : [ 'members', 'administrators' ],
	handler : function(ident) {
		var message = this.commandString.substring(this.commandString.indexOf(' ') + 1);

		if (message.length < 1) {
			return;
		}

		this.server.pushMessage(ident, {
			type : 'self',
			message : message
		});
	}
};