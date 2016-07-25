'use strict';
const passport = require('passport');
const config = require('../config');
const h = require('../helpers');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = () => {
	passport.serializeUser((user, done) => {		// store user infomation into mongoDB
		done(null, user.id);				// this is the id mongoDB assigned to user
	});

	passport.deserializeUser((id, done) => {		// when deserializeUser from mongoDB, the user info is availabie through req object with variable user
		// Find the user using _id
		h.findById(id)
			.then(user => done(null, user))
			.catch(error => console.log('Error when deserializeUser!'));
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
						.catch(error => console.log('Error when creating new user'));
				}
			})
	}

	passport.use(new FacebookStrategy(config.fb, authProcessor));
	passport.use(new TwitterStrategy(config.twitter, authProcessor));

}