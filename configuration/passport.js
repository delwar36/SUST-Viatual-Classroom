const LocalStrategy = require('passport-local').Strategy;
const Cryptr = require('cryptr');
require('dotenv/config');

// Load User model
const User = require('../models/User');

const cryptr = new Cryptr(process.env.MY_SECRET_PASSWORD);

module.exports = function (passport)
{
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) =>
    {
      // Match user
      User.findOne({
        email: email
      }).then(user =>
      {
        if (user){
          if (user.isVerified === false){
            return done(null, false, { message: 'You are not verified successfully' });
          }
        }

        if (!user ) {
          return done(null, false, { message: 'That email is not registered' });
        }

        let userPassword = '';
        try {
          userPassword = cryptr.decrypt(user.password);
        }catch (e) {
          console.log(e);
        }
        // match password
        if (userPassword === password){
          return done(null, user);
        }else {
          return done(null, false, { message: 'Password incorrect' });
        }
      });
    })
  );

  passport.serializeUser(function (user, done)
  {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done)
  {
    User.findById(id, function (err, user)
    {
      done(err, user);
    });
  });
};