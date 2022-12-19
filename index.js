
// import express and morgan modules into the package:
const express = require('express')
    morgan = require('morgan');
// declare variable that encapsulates Express functionality to configure web server:
// variable then used to route HTTP requests and responses
const app = express();

// by invoking app.use() before app.get() you designate that the specified functions are called with every request (middleware)
// pass morgan into the app.use() 
// morgan is a preexisting library to be used as logging middleware
// common parameter specifies, that morgan should be logged using Morgan'S "common" format
// which logs basic data such as IP adress, time of request, request method and path, and status code
app.use(morgan('common'));

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



