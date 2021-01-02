const fs = require('fs');
const http = require('http');
const express = require('express');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser= require('body-parser');

const app = express();

const authRouter = require('./routes/auth');
const compression = require('compression');

app.use(express.static('server'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(compression());
app.use(session({
    secret: 'sfefgffss',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));

const authData = {
    email: 'poer611@naver.com',
    password: '111111',
    nickname: 'hs',
};

const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user,done) {
    console.log('serializeUser', user);
    done(null, user.email);
});

passport.deserializeUser(function(id, done) {
     console.log('deserializeUser', id);
   done(null,authData);
});

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'pwd'
    },
    function(username, password, done) {
        console.log('LocalStrategy', username, password);
        if(username === authData.email) {
            if(password === authData.password) {
                return done(null, authData);
            } else {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
        } else {
          return done(null, false, {
            message: 'Incorrect username.'
          });   
        }
    }
));

app.post('/auth/login_process', passport.authenticate('local', {
    failureRedirect:'/auth/login'}), (req,res) => {
        req.session.save(() => {
            res.redirect('/')
        });
    });

app.use('/auth', authRouter);

app.get('/', (req,res) => {
    console.log(req.user); 
    res.sendFile('jstyle.html', { root: './server'});
}); 


app.use((req,res,next) => {
    res.status(404).send('Sorry can\'t find');
})

app.listen(3011, () => {
    console.log('App running');
});