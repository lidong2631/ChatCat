'use strict';
const passport = require('passport');
const config = require('../config');
const h = require('../helpers');
const logger = require('../logger');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = () => {
	passport.serializeUser((user, done) => {		// serialize method called when auth ends (after run done() in authProcessor). 
																							// passport will pass in user profile data and only store user id into session
		done(null, user.id);				// this is the id mongoDB assigned to user
	});

	passport.deserializeUser((id, done) => {		// whenever a request with that data is received, passport fetch id from session and deserialize from mongodb
		// Find the user from mongodb using _id
		h.findById(id)
			.then(user => done(null, user))
			.catch(error => logger.log('error', 'Error when deserializing the user: ' + error));
	})

	let authProcessor = (accessToken, refreshToken, profile, done) => {
		// Find a user in the local db using profile.id
		// If the user is found, return the user data using the done()
		// if the user is not found, create one in the local db and return
		h.findOne(profile.id)
			.then(result => {
				if (result) {
					done(null, result);
				} else {
					// Create a new user and return 
					h.createNewUser(profile)
						.then(newChatUser => done(null, newChatUser))
						.catch(error => logger.log('error', 'Error when creating new user: ' + error));
				}
			})
	}

	passport.use(new FacebookStrategy(config.fb, authProcessor));
	passport.use(new TwitterStrategy(config.twitter, authProcessor));

}