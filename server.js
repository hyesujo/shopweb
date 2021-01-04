const express = require('express');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser= require('body-parser');
const flash = require('connect-flash');
var ejs = require('ejs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json'),
    db = low(adapter),
    bcrypt = require('bcrypt'),
    shortid = require('shortid'),
    sanitizeHtml = require('sanitize-html'),
    app = express(),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    compression = require('compression'),
    { Cookie } = require('express-session');

db.defaults({user:[]}).write();
app.use(flash());
app.set('view engine', "ejs");
app.use('/server', express.static(path.join(__dirname+'/server')));
// app.use(bodyParser.urlencoded({
//     extended: false
// }));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(compression());
app.use(session({
    secret: 'sfefgffss',
    resave: false,
    saveUninitialized: true,
    cookie:{secure:false,httpOnly:true},
    store: new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user,done) {
    console.log('serializeUser', user);
    done(null, user);
});


passport.deserializeUser(function(user, done) {
    console.log('deserializeUser', user);
    let user1 = db.get('user').find({
        id:user.id
    }).value();
    console.log('deserializeUser', user1);
   done(null, user1);
});

passport.use(new LocalStrategy(
    {
      usernameField : 'email',
      passwordField: 'pwd',
      session : true,
    },
    function(email, password, done) {
        console.log('localStorage', email, password);
        let user = db.get('user').find({
            email:email
            }).value();

        if(user) {
           bcrypt.compare(password, user.password, function(err, result) {
            if(result) {
                console.log('성공');
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



app.get('/', (req,res) => {
    // res.sendFile('jstyle.html', { root: './server'});
    // console.log(req.session.passport.user.email)
    let userEmail = req.session.passport?.user?.email || '';
    res.render(path.join(__dirname,'./server/jstyle.ejs'),{'t':userEmail});
    
}); 

app.get('/auth/login', (req,res) => {
    res.sendFile('login.html', { root: './server'});
});

app.post('/auth/login_process', passport.authenticate('local', {
    failureRedirect:'/auth/login'}), (req,res) => {
        console.log('실행하면');
        // res.redirect('/');
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

app.get('/auth/logout', (req,res) => {
     req.logout();
     req.session.destroy(function(err){
        res.redirect('/');
     })
});


app.use((req,res,next) => {
    res.status(404).send('Sorry can\'t find');
})

app.listen(3012, () => {
    console.log('App running');
});