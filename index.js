const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    Movies = Models.Movie,
    Users = Models.User;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/myFlixDataBase', {useNewUrlParser: true, useUnifiedTopology: true});

// let users = [ 
//     {
//         id: 1, 
//         name: "Johanna",
//         favoriteMovies: []
//     },
//     {
//         id: 2,
//         name: " Hendrik",
//         favoriteMovies: ["The Intouchables"]
//     },
// ]

// let movies = [
//     {
//         Title: "Perks of being a Wallflower",
//         Director: {
//             Name: "Stephen Chbosky",
//             Bio: "Stephen Chbosky was born on January 25, 1970 in Pittsburgh, Pennsylvania, USA. He is a writer and producer, known for The Perks of Being a Wallflower (2012), Beauty and the Beast (2017) and Wonder (2017). He has been married to Liz Maccie since September 18, 2010. They have two children. ",
//             YearOfBirth: "1970",
//             YearOfDeath: "",
//         },
//         Description: "An introvert freshman is taken under the wings of two seniors who welcome him to the real world.",
//         Genre: {
//             Name: "Drama",
//             Description: "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
//         },
//         imageUrl: "https://www.imdb.com/title/tt1659337/mediaviewer/rm2134748161/?ref_=tt_ov_i",


//     },
//     {
//         Title: "The Intouchables",
//         Director: {
//             Name: "Olivier Nakache & Éric Toledano",
//             Bio: "O.N.: Olivier Nakache was born on April 15, 1973 in Suresnes, Hauts-de-Seine, France. He is a writer and producer, known for The Intouchables (2011), C'est la vie! (2017) and The Specials (2019). / E.T.: Éric Toledano was born on July 3, 1971 in Paris, France. He is a writer and producer, known for The Intouchables (2011), C'est la vie! (2017) and The Specials (2019).  ",
//             YearOfBirth: "O.N.: 1973, E.T.: 1971",
//             YearOfDeath: "",
//          },
//         Description: "After he becomes a quadriplegic from a paragliding accident, an aristocrat hires a young man from the projects to be his caregiver. ",
//         Genre: {
//             Name:"Biography",
//             Description: "A biographical film or biopic  is a film that dramatizes the life of a non-fictional or historically-based person or people. Such films show the life of a historical person and the central character's real name is used.[2] They differ from docudrama films and historical drama films in that they attempt to comprehensively tell a single person's life story or at least the most historically important years of their lives.",
//         },
//         imageUrl: "https://www.imdb.com/title/tt1675434/mediaviewer/rm1305720576/?ref_=tt_ov_i",
//     },
//     {
//         Title: "Goodbye Lenin",
//         Director: {
//             Name: "Wolfgang Becker",
//             Bio: "Wolfgang Becker was born on June 22, 1954 in Hemer, North Rhine-Westphalia, Germany. He is a director and writer, known for Good Bye Lenin! (2003), Fjärilar (1988) and Child's Play (1992).",
//             YearOfBirth: "1954 ",
//             YearOfDeath: "",
//          },
//         Description: "In 1990, to protect his fragile mother from a fatal shock after a long coma, a young man must keep her from learning that her beloved nation of East Germany as she knew it has disappeared.",
//         Genre: {
//             Name:"Comedy",
//             Description: "A comedy film is a category of film which emphasizes humor.[1] These films are designed to make the audience laugh through amusement.[2] Films in this style traditionally have a happy ending (black comedy being an exception).",
//         },
//         imageUrl: "https://www.imdb.com/title/tt0301357/mediaviewer/rm802921728/?ref_=tt_ov_i",
//     },
//     {
//         Title: "Dead Poets Society",
//         Director: {
//             Name: "Peter Weir",
//             Bio: "Peter Weir was born on August 21, 1944 in Sydney, New South Wales, Australia. He is a director and writer, known for Master and Commander: The Far Side of the World (2003), The Way Back (2010) and Witness (1985). He has been married to Wendy Stites since 1966. They have two children.",
//             YearOfBirth: "1944 ",
//             YearOfDeath: "",
//          },
//         Description: "Maverick teacher John Keating uses poetry to embolden his boarding school students to new heights of self-expression.",
//         Genre: {
//             Name:"Drama",
//             Description: "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
//         },
//         imageUrl: "https://www.imdb.com/title/tt0097165/mediaviewer/rm1115750912/?ref_=tt_ov_i",
//     },
//     {
//         Title: "Life is beautiful",
//         Director: {
//             Name: "Roberto Benigni",
//             Bio: "Roberto Benigni was born on October 27, 1952 in Manciano La Misericordia, Castiglion Fiorentino, Tuscany, Italy. He is an actor and writer, known for Life Is Beautiful (1997), The Tiger and the Snow (2005) and Down by Law (1986). He has been married to Nicoletta Braschi since December 26, 1991. ",
//             YearOfBirth: "1952 ",
//             YearOfDeath: "",
//          },
//         Description: "When an open-minded Jewish waiter and his son become victims of the Holocaust, he uses a perfect mixture of will, humor, and imagination to protect his son from the dangers around their camp.",
//         Genre: {
//             Name:"Drama",
//             Description: "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
//         },
//         imageUrl: "https://www.imdb.com/title/tt0118799/mediaviewer/rm2303464448/?ref_=tt_ov_i ",

//     },
//     {
//         Title: "Im Labyrinth des Schweigens",
//         Director: {
//             Name: "Giulio Ricciarelli",
//             Bio: "Giulio Ricciarelli was born on August 2, 1965 in Milan, Lombardy, Italy. He is an actor and producer, known for Labyrinth of Lies (2014), Lights (2009) and Vincent (2004). He was previously married to Lisa Martinek. ",
//             YearOfBirth: "1965",
//             YearOfDeath: "",
//          },
//         Description: "A story that exposes the conspiracy of prominent German institutions and government branches to cover up the crimes of Nazis during World War II. ",
//         Genre: {
//             Name:"Drama",
//             Description: "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
//         },
//         imageUrl: "https://www.imdb.com/title/tt3825638/mediaviewer/rm1884423936/?ref_=tt_ov_i",
//     },
//     {
//         Title: "What dreams may come",
//         Director: {
//             Name: "Vincent Ward",
//             Bio: "Vincent Ward has produced, executive produced and/or written and directed feature films including What Dreams May Come (Which won an Oscar and was nominated for 2 Academy Awards), The River Queen (Won best film in Shanghai) and The Last Samurai (4 Academy Award nominations and winner of Best Foreign Film in Japan) developing the underlying material he chose the director, before acting as an executive producer on this film. Ward's films have earned critical acclaim and festival attention whilst achieving a wide, eclectic audience. Vigil (1984), The Navigator: A Medieval Odyssey (1988) and Map of the Human Heart (1993) were the first films by a New Zealander to be officially selected for the Cannes Film Festival. Between them they garnered close to 30 national and international awards (including the Grand Prix at festivals in Italy, Spain, Germany, France and the United States). His latest feature film Rain of the Children (2008) was voted by the audience, from 250 feature films, to win the Grand Prix at Poland's largest film festival. The film was also nominated for best director in New Zealand and Australia. Ward was awarded an Order of New Zealand Merit in 2007 and is in the process of actively searching for material for new projects. ",
//             YearOfBirth: "1956",
//             YearOfDeath: "",
//          },
//         Description: "Chris Nielsen dies in an accident, and enters Heaven. But when he discovers that his beloved wife Annie has killed herself out of grief over the loss, he embarks on an afterlife adventure to reunite with her.",
//         Genre: {
//             Name:"Drama",
//             Description: "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
//         },
//         imageUrl: "https://www.imdb.com/title/tt0120889/mediaviewer/rm11484160/?ref_=tt_ov_i ",
//     },
//     {
//         Title: "Schindler's List",
//         Director: {
//             Name: "Steven Spielberg",
//             Bio: "Steven Spielberg, in full Steven Allan Spielberg, (born December 18, 1946, Cincinnati, Ohio, U.S.), American motion-picture director and producer whose diverse films—which ranged from science-fiction fare, including such classics as Close Encounters of the Third Kind (1977) and E.T.: The Extra-Terrestrial (1982), to historical dramas, notably Schindler’s List (1993) and Saving Private Ryan (1998)—enjoyed both unprecedented popularity and critical success. ",
//             YearOfBirth: "1946",
//             YearOfDeath: "",
//          },
//         Description: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis. ",
//         Genre: {
//             Name:"Biography",
//             Description: "A biographical film or biopic  is a film that dramatizes the life of a non-fictional or historically-based person or people. Such films show the life of a historical person and the central character's real name is used.[2] They differ from docudrama films and historical drama films in that they attempt to comprehensively tell a single person's life story or at least the most historically important years of their lives.",
//         },
//         imageUrl: "https://www.imdb.com/title/tt0108052/mediaviewer/rm1610023168/?ref_=tt_ov_i ",
//     }
// ]

// Create 

// -> Allow new users to register;
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
// first check if username already exists using findOne command
// if it doesn't exist create a new user
// then callback function that takes newly created document as parameter which responds feedback of completed new user
// error handling functions
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Userame + ' already exists'); 
            }
            else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {res.status(201).json(user)})
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });        
});

// -> Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later);
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle }  = req.params;

    let user = Users.find( user => User.id == id);

    if (user) {
        user.FavoriteMovies.push(movieTitle);
        res.status(201).send(`${movieTitle} has been added to user ${id}'s array`);;
    }
    else {
        res.status(400).send('users need names');
    }
})


// UPDATE

// -> Allow users to update their user info (username);
app.put('/users/:id', (req, res) => {
    const { id }  = req.params;
    const updatedUSer = req.body;

   let user = Users.find(user => User.id == id); // use == instead of === as id values are mixed strings and numbers and === only allows for exact matches

   if(user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
   }
   else {
    res.status(400).send('no such user');
   }
})


// READ endpoints

// render documentation file
app.get('/documentation', (req, res) => {
    console.log('documentation has been called')
    res.sendFile('public/documentation.html', {root: __dirname});
});

// -> Return a list of ALL movies to the user;
app.get('/movies', (req, res) => {
    console.log('get movies has been called');
    Movies.find()
        .then((Movies) => {
            res.status(201).json(Movies);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        });
})

// -> Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
app.get('/movies/:title', (req, res) => {
    // const title = req.params.title;
    const { title }  = req.params; // object destructuring same as line above
    const movie = Movies.find(Movie => Movie.Title === title );

    if (Movie) {
        res.status(200).json(Movie);
    }
    else {
        res.status(400).send('no such movie');
    }
})

// -> Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName}  = req.params; // object destructuring same as line above
    const genre = Movies.find(Movie => Movie.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre);
    }
    else {
        res.status(400).send('No such genre');
    }
})

// -> Return data about a director (bio, birth year, death year) by name;
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName}  = req.params; // object destructuring same as line above
    const director = Movies.find(Movie => Movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director);
    }
    else {
        res.status(400).send('No such director');
    }
})

// -> return data on all users
app.get('/users', (req, res) => {
    Users.find()
    .then((Users) => {
        res.status(201).json(Users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
})

// -> return data about specific user via username
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Userame: req.params.Username})
    .then((User) => {
        res.json(User);
    })
    .catch((err) => {
        res.status(500).send('Error: ' + err);
    })
})

// DELETE

// -> Allow users to remove a movie from their list of favorites;
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle }  = req.params;

    let user = Users.find( user => User.id == id);

    if (user) {
        User.FavoriteMovies = User.FavoriteMovies.filter( title => title !== movieTitle);
        res.status(201).send(`${movieTitle} has been removed from user ${id}'s array`);
    }
    else {
        res.status(400).send('no such user');
    }
})

// -> Allow existing users to deregister 
app.delete('/users/:id', (req, res) => {
    const { id }  = req.params;

    let user = Users.find( user => User.id == id);

    if (user) {
        users = Users.filter( user => User.id != id);
        res.status(201).send(`user ${id} has been deleted`);
    }
    else {
        res.status(400).send('no such user');
    }
})

app.listen(8080, () => console.log("Listening on 8080"));