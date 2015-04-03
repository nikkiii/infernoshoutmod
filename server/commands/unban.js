module.exports = {
	groups : [ 'administrators' ],
	handler : function(ident) {
		if (this.args.length < 1) {
			return;
		}
		var userid = parseInt(this.args[0]);

		if (this.server.unban(userid)) {
			this.server.pushMessage(ident, {
				type : 'self',
				message : 'has unbanned ' + userid + ' from the chat.'
			});
		}
	}
};