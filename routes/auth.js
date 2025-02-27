const router = require("express").Router();
const User = require('../models/User.model');
const bcrypt = require('bcrypt');

router.get('/signup', (req, res, next) => {
	res.render('signup');
});

router.get('/login', (req, res, next) => {
	res.render('login');
});

router.post('/signup', (req, res, next) => {
	console.log(req.body);
	const { username, password } = req.body;
	
    if (username.length === 0) {
		res.render('signup', { message: 'Your username cannot be empty' });
		return;
	}

	if (password.length < 8) {
		res.render('signup', { message: 'Password has to be min 8 characters' });
		return;
	}
	
	User.findOne({ username: username })
		.then(userFromDB => {
			
			if (userFromDB !== null) {
				res.render('signup', { message: 'This username is already taken' });
				return;
			} else {
				const salt = bcrypt.genSaltSync();
				const hash = bcrypt.hashSync(password, salt);
				console.log(hash);
				User.create({ username: username, password: hash })
					.then(createdUser => {
						console.log(createdUser);
						res.redirect('/login');
					})
					.catch(err => {
						next(err);
					})
			}
		})
});

router.post('/login', (req, res, next) => {

	const { username, password } = req.body;
	// check if we have a user with that username (from the input field) in the db	
	User.findOne({ username: username })
		.then(userFromDB => {
			if (userFromDB === null) {
				// if there is no user in the db -> the username is not correct -> show signup again
				res.render('login', { message: 'Invalid credentials' });
				return;
			}
			//  if the username is correct -> we want to check the password from the input against the hash in the db	
			// bcrypt.compare either evaluates to true or false
			if (bcrypt.compareSync(password, userFromDB.password)) {
				// if it matches -> all credentials are correct 
				//  -> we log the user in
				req.session.user = userFromDB;
				res.redirect('/profile');
			} else {
				// if that is not matching -> the password is not correct -> show the form again	
				res.render('login', { message: 'Invalid credentials' });
				return;
			}
		})


});

router.get('/logout', (req, res, next) => {
	// this logs the user out	
	req.session.destroy(err => {
		if (err) {
			next(err);
		} else {
			res.redirect('/');
		}
	})
});


module.exports = router;