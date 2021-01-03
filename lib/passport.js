let db = require('../lib/db');
const bcrypt = require('bcrypt');

module.exports = (app) => {

    const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    passport.serializeUser(function(user,done) {
        console.log('serializeUser', user);
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
        console.log('deserializeUser', id, user);
        let user = db.get('user').find({
            id:id
        }).value();
        console.log('deserializeUser', id, user);
       done(null, user);
    });
    
    passport.use(new LocalStrategy(
        {
          usernameField : 'email',
          passwordField: 'pwd'
        },
        function(email, password, done) {
            console.log('LocalStrategy', email, password);
            let user = db.get('user').find({
                email:email
                }).value();

            if(user) {
               bcrypt.compare(password, user.password, function(err, result) {
                if(result) {
                    return done(null, user, { 
                        message: 'Welcome'
                    });
                } else {
                    return done(null, false, {
                        message: 'Password is not correct.'
                    });
                }
               });
            } else {
               return done(null, false, {
                 message: 'Wrong email'
               });
          }
        }
    ));
    return passport;
}

