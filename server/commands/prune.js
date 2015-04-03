module.exports = {
	groups : [ 'administrators' ],
	handler : function(ident) {
		var userId = this.args.length > 0 ? parseInt(this.args[0]) : null;

		var pruned = this.server.prune(userId);

		if (pruned > 0) {
			this.server.pushMessage(ident, {
				type : 'self',
				message : userId ? 'has pruned all messages by ' + userId : 'has pruned the chat'
			});
		}
	}
};