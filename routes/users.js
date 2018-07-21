const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

const User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const passwordConfirmation = req.body.passwordConfirmation;

  req.check('name', 'Name is required').notEmpty();
  req.check('email', 'Email is required').notEmpty();
  req.check('email', 'Email is not valid').isEmail();
  req.check('username', 'Username is required').notEmpty();
  req.check('password', 'Password is required').notEmpty();
  req.check('passwordConfirmation', 'Passwords do not match').equals(password);

  const errors = req.validationErrors();

  if (errors) {
    res.render('register', {errors});
  } else {
    const newUser = new User ({
      name,
      email,
      username,
      password,
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) return console.log(err);
        newUser.password = hash;
        newUser.save((err) => {
          if (err) return console.log(err);
          req.flash('success', 'You are now registred and can log in');
          res.redirect('/users/login');
        });
      });
    });
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
