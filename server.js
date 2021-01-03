
const express = require('express');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser= require('body-parser');
const flash = require('connect-flash');
var ejs = require('ejs');

const app = express();
var passport = require('./lib/passport')(app);
const authRouter = require('./routes/auth')(passport);
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

app.use(flash());
app.set('view engine', "ejs");


app.use('/auth', authRouter);

app.get('/', (req,res) => {
    console.log(req.user); 
    res.sendFile('jstyle.html', { root: './server'});
}); 
 
app.get('/logout', (req,res) => {
    req.logout();
     res.sendFile('logout.html', {root: './server'});
});


app.use((req,res,next) => {
    res.status(404).send('Sorry can\'t find');
})

app.listen(3011, () => {
    console.log('App running');
});