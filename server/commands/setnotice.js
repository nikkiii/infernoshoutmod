module.exports = {
	groups : [ 'administrators' ],
	handler : function(ident) {
		this.server.setNotice(this.commandString.substring(this.commandString.indexOf(' ') + 1));
	}
};