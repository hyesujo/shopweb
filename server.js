const fs = require('fs');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('server'));

app.get('/', (req,res) => {
    res.sendFile('jstyle.html', { root: './server'});
});


app.listen(3010, () => {
    console.log('App running');
});