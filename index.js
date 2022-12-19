
// import express, morgan, fs and path modules into the package:
const express = require('express')
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

// declare variable that encapsulates Express functionality to configure web server:
// variable then used to route HTTP requests and responses
const app = express();

// create a write stream in append mode for log.txt file in root directory#
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

// by invoking app.use() before app.get() you designate that the specified functions are called with every request (middleware)
// pass morgan into the app.use() 
// morgan is a preexisting library to be used as logging middleware
// set up the logger
app.use(morgan('combined', {stream: accessLogStream}));

// GET requests which define the different URLs that requests can be sent to and the associated response
// get simply retrieves data from server
// app is and instance of express() as defined as a variable above
app.get ('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
});

app.listen(8080, () => {
    console.log('Your app is listening to port 8080.');
});



