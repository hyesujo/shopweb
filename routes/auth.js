const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');



router.use(express.static('server'));

router.get('/login', (req,res) => {
    res.sendFile('login.html', { root: './server'});
});


router.post('/login_process', (req, res, next) => {
    const post = req.body;
    const email = post.email;
    const password = post.pwd;
    if (email === authData.email && password === authData.password) {
        res.send('welcome');
    } else {
        res.send('who?');
    }
});


module.exports = router;