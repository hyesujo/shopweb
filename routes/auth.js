const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const shortid = require('shortid');
var ejs = require('ejs');
let db = require('../lib/db');
const bcrypt = require('bcrypt');

const { endianness } = require('os');
const { response } = require('express');
const e = require('express');


module.exports = (passport) => {
    router.use(express.static('server'));

    router.get('/login', (req,res) => {
        res.sendFile('login.html', { root: './server'});
    });
    
    
    router.post('/login_process', passport.authenticate('local', {
        failureRedirect:'/auth/login'}), (req,res) => {
            req.session.save(() => {
                res.redirect('/logout')
            });
        });

    router.get('/register', (req,res) => {
        res.sendFile('register.html', {root: './server'});
    })

    router.post('/register_process', (req, res) => {
        let post = req.body;
        let email = post.email;
        let pwd = post.pwd;
        let pwd2 = post.pwd2;
        let displayName = post.displayName;
        if(pwd !== pwd2) {
            req.flash('error', 'Password must same!');
            res.redirect('/auth/register');
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
                    res.redirect('/logout');
                   })
                });
            });
        }
    });
    return router;
}