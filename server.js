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

const mysql = require('mysql');
const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'qwea1480!!',
    database: 'product'
});

connection.connect();


db.defaults({user:[]}).write();
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
app.use(flash());


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
            if(error) throw error;
            if(result) {
                console.log('성공');
                return done(null, user, { 
                    message: 'Welcome'
                });
            } else {
                return done(null, false, {
                    message: '비밀번호가 틀렸어요!'
                });
            }
           });
        } else {
           return done(null, false, {
             message: '이메일이 틀렸어요!'
           });
      }
    }
));



app.get('/', (req,res) => {
    connection.query('SELECT * FROM items limit 4', (error, items1) => {
        connection.query('SELECT * FROM items limit 4 offset 4',(error, items2) => {
            if(error) throw error;
            let userEmail = req.session.passport?.user?.email || '';
            for(let i = 0; i < items1.length; i++) {
            let toSt = items1[i].price.toString();
            let sp = toSt.split("");
            let splice1 = sp.splice(2,0, ',');
            let jo = sp.join("");
            // console.log(jo);
            }
            res.render(path.join(__dirname,'./server/jstyle.ejs'),{
                't':userEmail,
                'data1': items1,
                'data2':items2,
            });         
         }); 
        });
    });

    app.get('/shop/shopdetail', (req,res) => {
        connection.query(`SELECT * FROM items WHERE id=${req.query.id}`, (error, items) => {
            if(error) throw error;
                res.render(path.join(__dirname,'./server/detail.ejs'),{
                    'data': items,
                });         
             }); 
        });


app.get('/auth/login', (req,res) => {
    let fmsg = req.flash();
    let feedback = '';
    if(fmsg.message) {
        feedback = fmsg.message[0];
    }
    console.log(feedback);
    res.render(path.join(__dirname, './server/login.ejs'), {'fmsg': feedback});
});

app.post('/auth/login_process',(req,res,next) => {
    passport.authenticate('local', (err, user, info) => {
        if(req.session.flash) {
            req.session.flash = {}
        }
        req.flash('message', info.message)
        req.session.save(() => {
            if(err) {
                return next(err);
            }
            if(!user) {
                return res.redirect('/auth/login');
            }
             req.login(user, (err) => {
                if (err) {
                    return next(err)
                }
                return req.session.save(() => {
                    res.redirect('/');
                });
             });
            });
        })(req, res, next)
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
    res.status(404).send('Sorry can\'t find!');
})

app.listen(3012, () => {
    console.log('App running');
});