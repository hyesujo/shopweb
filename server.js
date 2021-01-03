
const express = require('express');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser= require('body-parser');
const flash = require('connect-flash');
var ejs = require('ejs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({user:[]}).write();
const bcrypt = require('bcrypt');
const shortid = require('shortid');
const sanitizeHtml = require('sanitize-html');

const app = express();
const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy;
    
app.use(passport.initialize());
app.use(passport.session());

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

passport.serializeUser(function(user,done) {
    console.log('serializeUser', user);
    done(null, user.id);
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

passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id, user);
    let user = db.get('user').find({
        id:id
    }).value();
    console.log('deserializeUser', id, user);
   done(null, user);
});

app.use(flash());
app.set('view engine', "ejs");

app.get('/', (req,res) => {
    console.log(req.user); 
    res.sendFile('jstyle.html', { root: './server'});
}); 

app.get('/auth/login', (req,res) => {
    res.sendFile('login.html', { root: './server'});
});

app.post('/auth/login_process', passport.authenticate('local', {
    failureRedirect:'/login'}), (req,res) => {
        req.session.save(() => {
            res.redirect('/');
        });
    });

    app.get('/auth/register', (req,res) => {
        res.sendFile('register.html', {root: './server'});
    });

    app.post('/auth/register_process', (req, res) => {
        let post = req.body;
        let email = post.email;
        let pwd = post.pwd;
        let pwd2 = post.pwd2;
        let displayName = post.displayName;
        if(pwd !== pwd2) {
            req.flash('error', 'Password must same!');
            res.redirect('/register');
        } else {
            bcrypt.hash(pwd, 10, (err, hash) => {
                let user = {
                    id: shortid.generate(),
                    email : email,
                    password : hash,
                    displayName : displayName
                }; 
                db.get('user').push(user).write();
                req.login(user, function(err) {
                    console.log('redirect');
                   req.session.save(() => {
                    res.redirect('/');
                   })
                });
            });
        }
    });

// app.get('/logout', (req,res) => {
//     req.logout();
//      res.sendFile('logout.html', {root: './server'});
// });


app.use((req,res,next) => {
    res.status(404).send('Sorry can\'t find');
})

app.listen(3012, () => {
    console.log('App running');
});