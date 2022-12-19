
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

// array of movies and their directors
let topMovies = [
    {
        title: "Perks of being a Wallflower",
       director: "Tom Hooper",
    },
    {
      title: "The Intouchables",
      director: "Olivier Nakache & Éric Toledano",
    },
    {
      title: "Goodbye Lenin",
      director: "Wolfgang Becker",
    },
    {
      title: "Dead Poets Society",
      director: "Peter Weir",
    },
    {
      title: "Life is beautiful",
      director: "Roberto Benigni",
    },
    {
      title: "Im Labyrinth des Schweigens",
      director: "Giulio Ricciarelli",
    },
    {
      title: "What dreams may come",
      director: "Vincent Ward",
    },
    {
      title: "Schindler's List",
      director: "Steven Spielberg",
    },
    {
      title: "Forrest Gump",
      director: "Robert Zemeckis",
    },
    {
      title: "The Chorus",
      director: "Christophe Barratier",
    },
]

// by invoking app.use() before app.get() you designate that the specified functions are called with every request (middleware)
// The following function automatically routes all requests for static files to their corresponding files within the public folder on the server
app.use(express.static('public'));

// pass morgan into the app.use() 
// morgan is a preexisting library to be used as logging middleware
// set up the logger
app.use(morgan('combined', {stream: accessLogStream}));

// GET requests which define the different URLs that requests can be sent to and the associated response
// get simply retrieves data from server
// app is an instance of express() as defined as a variable above
app.get ('/', (req, res) => {
    res.send('Welcome to my Movie app!');
});

app.get('/movies', (req, res) => {
    res.json('topMovies');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
});

app.use((err, req, res, next) => {
    console.log('err.stack');
    res.status(500).send('Something went wrong, please return later');
});

app.listen(8080, () => {
    console.log('Your app is listening to port 8080.');
});



