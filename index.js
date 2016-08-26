let Promise = require('bluebird')
let Aerospike = require('aerospike')

class Database {
	constructor(config) {
		this.client = Aerospike.client(Object.assign({
		    hosts: [{
		        addr: '127.0.0.1',
		        port: 3000
		    }],
		    log: {
		        level: Aerospike.log.WARN
		    },
		    policies: {
		        timeout: 5000
		    },
			maxConnsPerNode: 1024
		}, config))
	}
}

Database.prototype.connect = () => {
	let connect = Promise.promisify(callback => {
		this.client.connect(error => {
			if(!callback)
				return

		    if(error)
				callback(error)
		    else
				callback(undefined)
		})
	})

	return this.ready = connect()
}

Database.prototype.get = Promise.(set, key)

module.exports = app => {
	app.db = new Database(app.config.database)
	return app.db.connect()
}

module.exports.client = config => {
	return new Database(config)
}