define(function() {
	function IDBWrapper(db) {
		this.db = db;
	}

	$.extend(IDBWrapper.prototype, {
		store : function(store, perms) {
			var trans = this.db.transaction([store], perms || 'readwrite');

			return new IDBStoreWrapper(trans.objectStore(store));
		}
	});

	function IDBStoreWrapper(store) {
		this.store = store;
	}

	$.extend(IDBStoreWrapper.prototype, {
		get : function(key, callback) {
			var res = this.store.get(key);

			res.onsuccess = function(e) {
				callback(false, e.target.result);
			};

			res.onerror = function(e) {
				callback(e, false);
			}
		},
		put : function(obj, callback) {
			var res = this.store.put(obj);

			if (callback) {
				res.onsuccess = function(e) {
					callback(false, e.target.result);
				};

				res.onerror = function(e) {
					callback(e, false);
				};
			}
		}
	});

	return {
		open : function(database, version, callbacks) {
			var open = indexedDB.open(database, version || 1);
			!callbacks.upgrade || (open.onupgradeneeded = function(e) {
				 callbacks.upgrade(e.target.result);
			});
			!callbacks.success || (open.onsuccess = function(e) {
				 callbacks.success(new IDBWrapper(e.target.result));
			});
			!callbacks.error || (open.onerror = function(e) {
				callbacks.error(e);
			});
		}
	};
});