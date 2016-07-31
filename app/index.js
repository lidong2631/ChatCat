'use strict';

const config = require('./config');
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');

// Social Authentication Logic
require('./auth')();

// Create an IO server instance
let ioServer = app => {
	app.locals.chatrooms = [];
	const server = require('http').Server(app); // bring in http module to create http server instance. Bind app to this instance
	const io = require('socket.io')(server); // bring in socket.io
	
	// set up socket.io for using redis to store buffer data
	io.set('transports', ['websocket']);

	let pubClient = redis(config.redis.port, config.redis.host, { 	// 2 separate client for redis
		auth_pass: config.redis.password 															// because we want pass authentication
	});
	let subClient = redis(config.redis.port, config.redis.host, {
		return_buffers: true,							// redis return data in string by default but we original data
		auth_pass: config.redis.password
	});

	io.adapter(adapter({
		pubClient,
		subClient
	}));
	//

	io.use((socket, next) => {
		require('./session')(socket.request, {}, next); // session middleware based on req object will fetch the associated profile of the active user from session
																										// and provide to the socket. However, there is nothing returned to res so we set an empty object
	});
	require('./socket')(io, app);
	return server;
}

module.exports = {
	router: require('./routes')(),
	session: require('./session'),
	ioServer,
	logger: require('./logger')
}