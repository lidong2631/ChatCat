'use strict';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('../config');
const db = require('../db');

if (process.env.NODE_ENV === 'production') {
	// 
	module.exports = session({
		secret: config.sessionSecret, // signed session cookie
		resave: false,							// if set true, middleware will save session again and again to database
		saveUninitialized: false,		// setup a session cookie in user's browser as well as an entry in session store even session has not been initialized with data
		store: new MongoStore({			// if you do not specify session store express will save session in memory. in production you need redis/mongodb
			mongooseConnection: db.Mongoose.connection
		})
	})
} else {
	// 
	module.exports = session({
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: true
	});
}