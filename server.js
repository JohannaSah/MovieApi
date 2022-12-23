const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

app.use(bodyParser.json());

let users = [ 
    {
        id: 1, 
        name: "Johanna",
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
        Title: "Perks of being a Wallflower",
        Director: "Tom Hooper",
    },
    {
        Title: "The Intouchables",
        Director: "Olivier Nakache & Éric Toledano",
    },
    {
        Title: "Goodbye Lenin",
        Director: "Wolfgang Becker",
    },
    {
        Title: "Dead Poets Society",
        Director: "Peter Weir",
    },
    {
        Title: "Life is beautiful",
        Director: "Roberto Benigni",
    },
    {
        Title: "Im Labyrinth des Schweigens",
        Director: "Giulio Ricciarelli",
    },
    {
        Title: "What dreams may come",
        Director: "Vincent Ward",
    },
    {
        Title: "Schindler's List",
        Director: "Steven Spielberg",
    },
    {
        Title: "Forrest Gump",
        Director: "Robert Zemeckis",
    },
    {
        Title: "The Chorus",
        Director: "Christophe Barratier",
    },
]

// READ endpoints
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})

app.get('/movies/:title', (req, res) => {
    // const title = req.params.title;
    const { title }  = req.params; // object destructuring same as line above
    const movie = movies.find(movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie);
    }
    else {
        res.status(400).send('no such movie');
    }

})





app.listen(8080, () => {"Listening on 8080"});