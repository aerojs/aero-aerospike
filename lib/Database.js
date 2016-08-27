let Promise = require('bluebird')
let Aerospike = require('aerospike')
let Key = Aerospike.Key

class Database {
	constructor(config) {
		config = Object.assign({
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
		}, config)
		
		if(config.host) {
			let parts = config.host.split(':')
			let port = parts[parts.length - 1]
			let addr = config.host.substring(0, config.host.length - port.length - 1)
			
			config.hosts = [{
				addr,
				port: parseInt(port)
			}]
			
			delete config.host
		}
		
		if(config.namespace) {
			this.namespace = config.namespace
			
			delete config.namespace
		}
		
		if(config.scanPriority) {
			this.scanPriority = config.scanPriority
			
			delete config.scanPriority
		} else {
			this.scanPriority = Aerospike.scanPriority.HIGH
		}
		
		this.client = Aerospike.client(config)
	}
}

Database.prototype.connect = function() {
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

Database.prototype.get = Promise.promisify(function(set, key, callback) {
	this.client.get(new Key(this.namespace, set, key), function(error, record, metadata) {
		// if(error && error.code !== 0)
		// 	console.warn(chalk.yellow('db.get warning:'), set, key, error)
		
		callback(error, record)
	})
})

Database.prototype.set = Promise.promisify(function(set, key, obj, callback) {
	this.client.put(new Key(this.namespace, set, key), obj, function(error) {
		// if(error && error.code !== 0)
		// 	console.warn(chalk.yellow('db.set warning:'), set, key, error)
		
		callback(error, obj)
	})
})

Database.prototype.remove = Promise.promisify(function(set, key, callback) {
	this.client.remove(new Key(this.namespace, set, key), function(error, key) {
		// if(error && error.code !== 0)
		// 	console.warn(chalk.yellow('db.remove warning:'), set, key, error)
		
		callback(error, key)
	})
})

Database.prototype.forEach = Promise.promisify(function(set, func, callback) {
	let scan = this.client.scan(this.namespace, set)
	
	scan.concurrent = true
	scan.nobins = false
	scan.priority = this.scanPriority

	let stream = scan.foreach()

	stream.on('data', func)
	stream.on('error', error => console.error(error))
	stream.on('end', callback)
})

Database.prototype.filter = function(set, func) {
	let records = []

	return this.forEach(set, record => {
		if(func(record))
			records.push(record)
	}).then(() => records)
}

Database.prototype.all = function(set, func) {
	let records = []
	return this.forEach(set, record => records.push(record)).then(() => records)
}

Database.prototype.getMany = Promise.promisify(function(set, keys, callback) {
	this.client.batchRead(keys.map(key => {
		return {
			key: new Key(this.namespace, set, key),
			read_all_bins: true
		}
	}), function(error, results) {
		callback(error, results.map(result => result.bins))
	})
})

module.exports = Database