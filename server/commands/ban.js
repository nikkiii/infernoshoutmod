module.exports = {
	groups : [ 'administrators' ],
	handler : function(ident) {
		if (this.args.length < 1) {
			return;
		}
		var userid = parseInt(this.args[0]);

		if (this.server.ban(userid)) {
			this.server.pushMessage(ident, {
				type: 'self',
				message: 'has banned ' + userid + ' from the chat.'
			});
		}
	}
};