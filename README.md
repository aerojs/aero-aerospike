# aero-aerospike

This client can be used as a standalone package (without using Aero). It is a lightweight wrapper built on top of the official node.js client. All API calls return [bluebird](https://github.com/petkaantonov/bluebird/) promises.

# API

## Creating a client

```js
let aerospike = require('aero-aerospike')

let db = aerospike.client({
	host: '127.0.0.1:3000',
	namespace: 'Test'
})

db.connect()
```

## aerospike.client
```js
let db = aerospike.client({
	host: '127.0.0.1:3000',
	namespace: 'Test'
})
```
The configuration parameters are directly handed over to the `Aerospike.client` constructor of the officia aerospike node library. Therefore you can also specify `hosts`, `log`, `policies` and so on. `host` is a shortcut notation added by this library. `namespace` specifies the namespace you want to operate on.

## get
```js
db.get('Users', 'key')
```

## set
```js
db.set('Users', 'key', {
	name: 'Will Smith'
})
```

Does not delete existing properties. Only updates the `name` property.

## remove
```js
db.remove('Users', 'key')
```

## forEach
```js
db.forEach('Users', user => console.log(user.name))
```

## filter
```js
db.filter('Users', user => user.isAdmin)
```

## getMany
```js
db.getMany('Users', ['key 1', 'key 2', 'key 3'])
```

## ready
```js
db.ready.then(() => 'Connected to database!')
```

## connect
```js
db.connect() === db.ready

db.connect().then(() => 'Connected to database!')
```