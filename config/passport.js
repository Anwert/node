const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = (passport) => {
  passport.use(new LocalStrategy((username, password, done) => {
    const query = { username };
    User.findOne(query, (err, user) => {
      if (err) throw err;
      if (!user) return done(null, false, { message: 'No user found' });

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) return done(null, user);
        return done(null, false, { message: 'Incorrect password' });
      });
    });
  }));


  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
