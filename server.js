const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

app.use(bodyParser.json());

let users = [ 
    {
        id: 1, 
        name: "Johanna";
        favoriteMovies: []
    },
    {
        id: 2,
        name: " Hendrik",
        favoriteMovies: ["The Intouchables"]
    },
]

let movies = [
    {

    }
]

// read endpoint#
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})



app.listen(8080, () => {"Listening on 8080"});