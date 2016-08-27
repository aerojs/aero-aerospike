let Database = require('./lib/Database')

module.exports = app => {
	app.db = new Database(app.config.database)
	
	return app.db.connect()
	.then(() => app.events.emit('database ready', app.db))
}

module.exports.client = config => {
	return new Database(config)
}