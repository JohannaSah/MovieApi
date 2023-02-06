const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    { send } = require('process'),
    mongoose = require('mongoose'),
    swaggerUi = require('swagger-ui-express'),
    swaggerJsdoc = require('swagger-jsdoc'),
    Models = require('./models.js'),
    Movies = Models.Movie,
    Users = Models.User,
    Genres = Models.Genre,
    Directors = Models.Director;

const {check, validationResult} = require('express-validator');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'https://movieapi-dcj2.onrender.com/', 'http://testsite.com']; // list of allowed domains
app.use(cors({
    origin:(origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // if a specific origin is not found on the list of allowed origins
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth')(app); // (app) ensures, that Express is available in auth.js file as well
const passport = require('passport'); // require passport module
require('./passport'); // import passport.js file

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
    flags: "a",
  });

app.use(express.static('public'));
app.use(morgan('combined', {stream: accessLogStream}));

const swaggerOptions = {
    swaggerDefinition: {
       info: {
          title: "myFlix API",
          description: "Movie Api",
          version: "1.0.0",
          servers: [
                { 
                    url: "http://localhost:8080",
                    description: "Local server"
                },
                { 
                    url: "https://movieapi-dcj2.onrender.com",
                    description: "Production server"
                } 
            ]
       },
    },
    apis: ["index.js"]
 };

 const swaggerDocs = swaggerJsdoc(swaggerOptions);
 
 app.use("/api-documentation", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); 


 // Your API routes here
 

// mongoose.connect('mongodb://localhost:27017/myFlixDataBase', {useNewUrlParser: true, useUnifiedTopology: true}).then( () => console.log('database is connected'));
// mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://myFlixDBadmin:9ZXdbmMo28eA@cluster0.bjuijqy.mongodb.net/myFlixMovieDataBase?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true });


// Create 

// -> Allow new users to register;
// first check if username already exists using findOne command
// if it doesn't exist create a new user
// then callback function that takes newly created document as parameter which responds feedback of completed new user
// error handling functions
// no authentication as anonymous users need to be able to register as new users
 /**
 * @swagger 
 * /users:
 * post:
 *  summary: allows new users to register
 *  tags: [Users]
 *  requestBody:
 *      required: true
 *  responses:
 *      '201':
 *          description: The user was succesfully created
 */
app.post('/users',
[
 check('Username', 'Username with a minimum of 5 characters is required').isLength({min:5}),// minimum lenght is 5 characters 
 check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
 check('Password', 'Password is required').not().isEmpty(),
 check('Email', 'Email does not appear to be valid').isEmail() 
], 
(req, res) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Userame + ' already exists'); 
            }
            else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
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
 /**
 * @swagger 
 * /users/{Username}/movies/{MovieID}:
 *  post:
 *     summary: Add a movie to a user's list of favorites by id
 *     tags: [Users]
 *     parameters:
 *       - name: Username
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's username
 *       - name: MovieID
 *         required: true
 *         description: The movie ID
 *
 *     responses:
 *       201:
 *         description: The movie was added
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
       $push: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

 
// UPDATE

// -> Allow users to update their user info (username);
/**
 * @swagger 
 * /users/{Username}:
 *  put:
 *    summary: Update a user's info, by username
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: Username
 *        schema:
 *          type: string
 *        required: true
 *        description: The user's username
 *    requestBody:
 *      required: true
 *    responses:
 *      200:
 *        description: The user was updated
 */
app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
[
    check('Username', 'Username is required').isLength({min:5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail() 
],
(req, res) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday,
            },
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});


// READ endpoints

// -> returns welcome page
/**
 * @swagger 
 * /:
 * get:
 *  summary: welcome page
 *  tags: [Welcome]
 *  responses:
 *      '200':
 *          description: A succesfull response
 */
app.get('/', (req, res) => {
    res.send('Welcome to myFlix');
});

// render documentation file
/**
 * @swagger 
 * /documentation:
 * get:
 *  summary: returns documentation.html
 * tags: [Documentation]
 *  responses:
 *      '200':
 *          description: A succesfull response
 */
app.get('/documentation', (req, res) => {
    console.log('documentation has been called')
    res.sendFile('public/documentation.html', {root: __dirname});
});

// -> Return a list of ALL movies to the user;
/**
 * @swagger 
 * /movies:
 * get:
 *  summary: Gets List of all movies
 *  tags: [Movies]
 *  responses:
 *      '200':
 *          description: A succesfull response
 *          content: application/json
 */
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log('movies has been called');
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// -> Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
/**
 * @swagger 
 * /movies/{Title}:
 *    get:
 *      summary: Get data about a single movie by title
 *      tags: [Movies]
 *      parameters:
 *          - name: Title
 *            description: Title of movie
 *            schema:
 *              type: string
 *      responses:
 *           200:
 *               description: A successful response
 */
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log('specific movie has been called');
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        });
});

// -> return data on all users
/**
 * @swagger 
 * /users:
 *  get:
 *      summary: Get all users
 *      tags: [Users]
 *      responses:
 *        200:
 *          description: A successful response
 */
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log('users has been called');
    Users.find()
    .then((Users) => {
        res.status(201).json(Users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// -> return data about specific user via username
/**
 * @swagger 
 * /users/{Username}:
 *    get:
 *      summary: Get a user by username
 *      tags: [Users]
 *      parameters:
 *        - name: Username
 *          description: User username
 *          schema:
 *            type: string
 *            format: string
 *      responses:
 *        200:
 *          description: A successful response
 */
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log(req.params.Username);
    Users.findOne({ Username: req.params.Username})
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        res.status(500).send('Error: ' + err);
    })
});

// -> return all directors via specified directors endpoint
/**
 * @swagger 
 * /directors:
 *    get:
 *      summary: Return all directors 
 *      tags: [Directors, Movies]
 *      responses:
 *         200:
 *           description: A successful response
 */
app.get('/directors', passport.authenticate('jwt', {session: false}), (req, res) => {
    Directors.find()
    .then((director) => {
        res.status(200).json(director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
});

// -> return director by name via specified directors endpoint
/**
 * @swagger 
 * /directors/{Name}:
 *    get:
 *      summary: Return data about a genre (description) by name
 *      tags: [Directors, Movies]
 *      parameters:
 *        - name: Name
 *          description: Name of genre
 *          schema:
 *            type: string
 *      responses:
 *         200:
 *           description: A successful response
 */
app.get('/directors/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Directors.findOne({Name: req.params.Name})
    .then((director) => {
        res.status(200).json(director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send ('Error: ' + err);
    })
});

// -> return all genres via specified genre endpoint
/**
 * @swagger 
 * /genres:
 *    get:
 *      summary: Return all genres
 *      tags: [Genres, Movies]
 *      responses:
 *         200:
 *           description: A successful response
 */
app.get('/genres', passport.authenticate('jwt', {session: false}), (req, res) => {
    Genres.find()
    .then((genres) => {
      res.status(200).json(genres);
    }).catch((err) =>{
      console.error(err);
      res.status(500).send('Error: ' + err);
    })
  });

//-< return genre by name via specified genre endpoint
/**
 * @swagger 
 * /genres/{Name}:
 *    get:
 *      summary: Return data about a genre (description) by name
 *      tags: [Genres, Movies]
 *      parameters:
 *        - name: Name
 *          description: Name of genre
 *          schema:
 *            type: string
 *      responses:
 *         200:
 *           description: A successful response
 */
app.get('/genres/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Genres.findOne({ Name: req.params.Name })
    .then((genre) => {
      res.status(200).json(genre);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    })
  });

// DELETE

// -> Allow users to remove a movie from their list of favorites;
/**
 * @swagger 
 * /users/{Username}/movies/{MovieID}:
 *   delete:
 *     summary: Remove a movie from a user's list of favorites by id
 *     tags: [Users]
 *     parameters:
 *       - name: Username
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's username
 *       - name: MovieID
 *         required: true
 *         description: The movie ID
 *     responses:
 *       202:
 *         description: The movie was deleted
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
            $pull: { FavoriteMovies: req.params.MovieID },
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error ' + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});

// -> Allow existing users to deregister 
/**
 * @swagger 
 * /users/{Username}:
 *   delete:
 *     summary: Delete a user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: Username
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's username
 *
 *     responses:
 *       202:
 *         description: The user was deleted
 */
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
