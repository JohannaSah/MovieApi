const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    { send } = require('process'),
    mongoose = require('mongoose'),
    // swaggerUi = require('swagger-ui-express'),
    // swaggerJsdoc = require('swagger-jsdoc'),
    Models = require('./models.js'),
    Movies = Models.Movie,
    Users = Models.User,
    Genres = Models.Genre,
    Directors = Models.Director;

const {check, validationResult} = require('express-validator');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['http://localhost:1234', 'http://localhost:4200', 'https://myflixjs.netlify.app', 'http://localhost:8080', 'https://johannasah.github.io/myFlix-Angular-client/', 'https://johannasah.github.io']; // list of allowed domains
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

require('./auth')(app); // (app) ensures, that Express is available in auth.js file as well
const passport = require('passport'); // require passport module
require('./passport'); // import passport.js file

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
    flags: "a",
  });

app.use(express.static('public'));
app.use(morgan('combined', {stream: accessLogStream}));

// const swaggerOptions = {
//     swaggerDefinition: {
//        info: {
//             title: "myFlix API",
//             description: "API for managing movies, genres, directors, and user profiles",
//             version: "1.0.0",
//             servers: [
//                 { 
//                     url: "http://localhost:8080",
//                     description: "Local server"
//                 },
//                 { 
//                     url: 'https://movieapi-dcj2.onrender.com/',
//                     description: "Production server"
//                 } 
//             ],
//             basePath: "/",
//             schemes: ["http"],
//             consumes: ["application/json"],
//             produces: ["application/json"],
//             securityDefinitions: {
//                 JWT: {
//                     type: "apiKey",
//                     name: "Authorization",
//                     in: "header"
//                 }
//             } 
//        },
//     },
//     apis: ["index.js"]
// };

//  const swaggerDocs = swaggerJsdoc(swaggerOptions);
 
//  app.use("/api-documentation", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); 


 // Your API routes here

mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Create 

// -> Allow new users to register;
// first check if username already exists using findOne command
// if it doesn't exist create a new user
// then callback function that takes newly created document as parameter which responds feedback of completed new user
// error handling functions
// no authentication as anonymous users need to be able to register as new users
/**
 * Route for creating a new user.
 *
 * @name POST /users
 * @function
 * @memberof module:routes/Users~usersRouter
 * @inner
 * @param {Object} req - Express HTTP request object.
 * @param {Object} res - Express HTTP response object.
 * @returns {Object} Returns a JSON object with the newly created user data or an error message.
 * @throws {Object} 422 status code if there are validation errors or 500 status code if there's an error with the database.
 * 
 * @example
 * // Example request:
 * {
 *   "Username": "johnDoe",
 *   "Password": "password123",
 *   "Email": "john.doe@example.com",
 *   "Birthday": "1990-01-01"
 * }
 *
 * // Example response:
 * {
 *   "Username": "johnDoe",
 *   "Password": "$2a$10$TJbE/7lgtZsNbvBYLJlNSeK1V7/Tx6yFdXq3fU6mpEJ6AetL6ZJz6",
 *   "Email": "john.doe@example.com",
 *   "Birthday": "1990-01-01T00:00:00.000Z",
 *   "_id": "616aa465f9b9ca52c5d1d742",
 *   "__v": 0
 * }
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
                return res.status(400).send(req.body.Username + ' already exists'); 
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
 * Endpoint for adding a movie to a user's list of favorite movies.
 *
 * @name AddFavoriteMovie
 * @function
 * @memberof module:routes/users~UsersRouter
 * @inner
 * @param {string} path - Express route path for the endpoint
 * @param {function} middleware - Passport middleware to authenticate the request using JWT strategy
 * @param {RequestHandler} callback - Express middleware function for handling the request and generating the response
 * @returns {undefined}
 * @throws {Error} 500 - Internal server error
 *
 * @example
 * // Example request:
 * // POST /users/johndoe/movies/1234567890abcdef
 * // Headers:
 * //  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * // Response:
 * //  Status: 200 OK
 * //  Body: {"_id":"60b008f9327a713d10aae1cd","Username":"johndoe","Password":"$2b$10$Mj9Xn/x1S8llzW05hLYU6u1J6gi4U6ImQxSC/b5t5Y9IaLr7yQ2Li","Email":"johndoe@example.com","Birthday":"1990-01-01T00:00:00.000Z","FavoriteMovies":["1234567890abcdef","234567890abcdef"]}
 *
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
 * Update a user's information
 *
 * @function
 * @name putUser
 * @memberof module:routes/users~UsersRoutes
 * @inner
 * @param {string} '/users/:Username' - The endpoint for updating a user's information
 * @param {Object} passport.authenticate('jwt', {session: false}) - The authentication middleware
 * @param {Object[]} check - The input validation middleware
 * @param {string} check.Username - The username to be updated
 * @param {string} check.Username.isLength - Check that the username is at least 5 characters long
 * @param {string} check.Username.isAlphanumeric - Check that the username only contains alphanumeric characters
 * @param {string} check.Password - The password to be updated
 * @param {string} check.Password.not().isEmpty - Check that the password is not empty
 * @param {string} check.Email - The email to be updated
 * @param {string} check.Email.isEmail - Check that the email is a valid email format
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} The updated user object
 * @throws {Object} 422 error - If input validation fails
 * @throws {Object} 500 error - If there is an error updating the user
 *
 * @example
 * // Example request:
 * // PUT /users/johndoe
 * // Headers:
 * //  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * //  Content-Type: application/json
 * // Body:
 * //  {
 * //    "Username": "newusername",
 * //    "Password": "newpassword",
 * //    "Email": "newemail@example.com",
 * //    "Birthday": "1990-01-01"
 * //  }
 * // Response:
 * //  Status: 200 OK
 * //  Body: {"_id":"60b008f9327a713d10aae1cd","Username":"newusername","Password":"$2b$10$Mj9Xn/x1S8llzW05hLYU6u1J6gi4U6ImQxSC/b5t5Y9IaLr7yQ2Li","Email":"newemail@example.com","Birthday":"1990-01-01T00:00:00.000Z","FavoriteMovies":["1234567890abcdef","234567890abcdef"]}
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

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
            $set: {
                Username: req.body.Username,
                Password: hashedPassword,
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
 * Send a welcome message to the user
 *
 * @function
 * @name welcomeMessage
 * @memberof module:routes/index~IndexRoutes
 * @inner
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} The HTTP response with a welcome message
 * @example
 * // GET /
 * // Response:
 * //  Status: 200 OK
 * //  Body: "Welcome to myFlix"
 */
app.get('/', (req, res) => {
    res.send('Welcome to myFlix');
});

// render documentation file
/**
 * Get the documentation page for the API
 *
 * @function
 * @name getDocumentationPage
 * @memberof module:routes/main~MainRoutes
 * @inner
 * @param {string} '/documentation' - The endpoint for the documentation page
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} The HTML file containing the API documentation
 * @example
 * // GET /documentation
 *
 */
app.get('/documentation', (req, res) => {
    console.log('documentation has been called')
    res.sendFile('public/documentation.html', {root: __dirname});
});

// -> Return a list of ALL movies to the user;
/**
 * Get a list of all movies
 *
 * @function
 * @name getMovies
 * @memberof module:routes/movies~MoviesRoutes
 * @inner
 * @param {string} '/movies' - The endpoint for getting all movies
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object[]} The list of all movies
 * @throws {Object} 500 error - If there is an error retrieving the movies
 * @example
 * // GET /movies
 * // Example response:
 * // Status: 200 OK
 * // Body: [
 * //   {
 * //     "_id": "60b008f9327a713d10aae1ce",
 * //     "Title": "The Shawshank Redemption",
 * //     "Description": "Two imprisoned men bond over a number of years...",
 * //     "Genre": {
 * //       "Name": "Drama",
 * //       "Description": "A drama is a genre of narrative fiction intended to be more serious than humorous in tone."
 * //     },
 * //     "Director": {
 * //       "Name": "Frank Darabont",
 * //       "Bio": "Frank Darabont is an American film director...",
 * //       "BirthYear": 1959,
 * //       "DeathYear": null
 * //     },
 * //     "ImagePath": "https://www.myflix.com/images/movies/the-shawshank-redemption.jpg",
 * //     "Featured": true
 * //   }, ..... ]
 */
app.get('/movies', (req, res) => {
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
 * GET a specific movie by title
 *
 * @function
 * @name getMovieByTitle
 * @memberof module:routes/movies~MoviesRoutes
 * @inner
 * @param {string} '/movies/:Title' - The endpoint for getting a specific movie by title
 * @param {Object} passport.authenticate('jwt', {session: false}) - The authentication middleware
 * @param {Object} req - The HTTP request object
 * @param {string} req.params.Title - The title of the movie to get
 * @param {Object} res - The HTTP response object
 * @returns {Object} The movie object with the matching title
 * @throws {Object} 404 error - If no movie with the given title is found
 * @throws {Object} 500 error - If there is an error retrieving the movie
 * @example
 * // GET /movies/The Shawshank Redemption
 * // Response:
 * //  Status: 200 OK
 * //  Body: {  
 *              "_id":"60b008f9327a713d10aae1cd",
 *              "Title":"The Shawshank Redemption",
 *              "Description":"Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
 *              "Genre":{
 *                      "Name":"Drama",
 *                      "Description":"Dramatic movies."},
 *              "Director":{
 *                      "Name":"Frank Darabont",
 *                      "Bio":"Frank Darabont is a Hungarian-American film director, screenwriter and producer."
 *                      "Year of Birth": "1978",
 *                      "Year of Death": null},
 *              "ImagePath":"https://www.imdb.com/title/tt0111161/mediaviewer/rm3580711936/",
 *              "Featured":true}
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
 * Get all users.
 *
 * @function
 * @name getUsers
 * @memberof module:routes/users~UsersRoutes
 * @inner
 * @param {string} '/users' - The endpoint for getting all users.
 * @param {Object} passport.authenticate('jwt', {session: false}) - The authentication middleware.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} A list of all users.
 * @throws {Object} 500 error - If there is an error retrieving the users.
 * @example
 * // GET /users
 * // Headers:
 * //  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * // Response:
 * //  Status: 201 Created
 * //  Body: [{_id: '6093b3a9c15dab001543b504', Username: 'johndoe', Password: '$2a$10$Hh3l3'...}, ...]
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
 * Get a user by username
 *
 * @function
 * @name getUser
 * @memberof module:routes/users~UsersRoutes
 * @inner
 * @param {string} '/users/:Username' - The endpoint for getting a user by username
 * @param {Object} passport.authenticate('jwt', {session: false}) - The authentication middleware
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} The user object
 * @throws {Object} 500 error - If there is an error retrieving the user
 * @example
 * // GET /users/:Username
 *
 * // Headers:
 * //  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * // Response:
 * //  Status: 200 OK
 * //  Body: {"_id":"60b008f9327a713d10aae1cd","Username":"johndoe","Password":"$2b$10$Mj9Xn/x1S8llzW05hLYU6u1J6gi4U6ImQxSC/b5t5Y9IaLr7yQ2Li","Email":"johndoe@example.com","Birthday":"1990-01-01T00:00:00.000Z","FavoriteMovies":["1234567890abcdef","234567890abcdef"]}
 *
 * // Error Response:
 * //  Status: 500 Internal Server Error
 * //  Body: "Error: Internal Server Error"
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
 * GET request for all directors.
 *
 * @name Get all directors
 * @function
 * @memberof module:routes/movies~moviesRouter
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express middleware next function.
 * @returns {Object} Returns an array of directors.
 * @throws {Error} Throws an error if there was an issue with the server.
 * @example
 * // Request
 * GET /directors
 * // Response
 * [
 *   {
 *     "_id": "602fb3d1aa2a0848b3c3e64f",
 *     "Name": "Steven Spielberg",
 *     "Bio": "Steven Allan Spielberg is an American film director, producer, and screenwriter.",
 *     "Year od Birth": "1946-12-18T00:00:00.000Z",
 *     "Year of Death": null,
 *   }, ....
 * ]
 * 
 * Error Response:
 *  // Status: 500 Internal Server Error
 * 
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
 * Get a director by name
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {string} req.params.Name - The name of the director to retrieve
 * @requires passport.authenticate('jwt', {session: false})
 *
 * @example
 * // Successful response
 * // Status Code: 200
 * // Response Body:
 * // {
 * //   "_id": "61643c31917a1208d9e1e407",
 * //   "Name": "Christopher Nolan",
 * //   "Bio": "Christopher Nolan is a British-American film director, producer, and screenwriter...",
 * //   "Birth": "1970-07-30T00:00:00.000Z",
 * //   "Death": null,
 * //   "__v": 0
 * // }
 *
 * @example
 * // Negative response
 * // Status Code: 500
 * // Response Body:
 * // "Error: Error message"
 *
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
 * Get all genres from the database.
 *
 * @name GET /genres
 * @function
 * @memberof module:routers/genresRouter
 * @inner
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object} Returns a JSON object containing all genres in the database.
 * @throws {Object} Returns an error object with status code 500 if there's a server error.
 *
 * @example
 * // Example response:
 * // HTTP/1.1 200 OK
 * // [
 * //    {
 * //      "_id": "614d2f12317a6906f2c6e7d8",
 * //      "Name": "Action",
 * //      "Description": "fast paced movie"
 * //    },
 * //    {
 * //      "_id": "614d2f27317a6906f2c6e7da",
 * //      "Name": "Comedy",
 * //      "Description": "funny movie"
 * //    }
 * // ]
 *
 * @example
 * // Example error response:
 * // HTTP/1.1 500 Internal Server Error
 * // Error: Unexpected server error occurred.
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

//-> return genre by name via specified genre endpoint
/**
 * GET request for a specific genre.
 * @function
 * @name getGenre
 * @memberof module:routes/genres
 * @inner
 * @param {string} '/genres/:Name' - Endpoint for getting a specific genre.
 * @param {function} passport.authenticate - Authenticates the JWT token for authorization.
 * @param {callback} callback - Express middleware callback function.
 * @returns {object} Returns a JSON object of the genre information.
 * @throws {object} Throws an error if there was a problem querying the database.
 * @example
 * // Returns a JSON object with information about the genre.
 * //   {
 * //      "_id": "614d2f27317a6906f2c6e7da",
 * //      "Name": "Comedy",
 * //      "Description": "funny movie"
 * //    }
 * 
 * // Returns an error if there was a problem querying the database.
 * Error: Failed to retrieve genre information.
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
 * Delete a movie from a user's favorite list.
 *
 * @function
 * @name deleteFavoriteMovie
 * @memberof module:routes/users~UsersRouter
 * @param {express.Request} req - Express request object.
 * @param {string} req.params.Username - Username of the user.
 * @param {string} req.params.MovieID - ID of the movie to be removed.
 * @param {express.Response} res - Express response object.
 * @param {Function} next - Express middleware function.
 * @throws {Object} 500 - Server error when the user cannot be updated.
 * @returns {Object} The updated user object with the movie removed from their favorite list.
 *
 * @example
 * // DELETE /users/johndoe/movies/60a28d86d09cc225e12c52a3
 * // Response:
 * {
 *   "_id": "60a27f5fa5e1e41d5c20b5f5",
 *   "Username": "johndoe",
 *   "Password": "$2a$10$wOr.iGKRKPGNMSoHSD9eWOItE4hdTLv7XdqZBL8C44izVl4w6kJ0K",
 *   "Email": "johndoe@gmail.com",
 *   "Birthday": "1990-01-01T00:00:00.000Z",
 *   "FavoriteMovies": []
 * }
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
 * Delete a user by their username.
 *
 * @function
 * @memberof module:routes/users
 * @name deleteUsersByUsername
 * @param {object} req - Express request object.
 * @param {string} req.params.Username - Username of the user to delete.
 * @param {object} res - Express response object.
 * @returns {object} - Returns an object containing the deleted user's information or an error message.
 * @throws {object} - Throws an error message if an error occurs during the delete operation.
 * @example
 * // Returns a success message with status code 200 when a user is successfully deleted.
 * deleteUsersByUsername(req, res);
 *
 * // Returns an error message with status code 400 when the specified user is not found.
 * deleteUsersByUsername(req, res);
 *
 * // Throws an error message with status code 500 if an error occurs during the delete operation.
 * deleteUsersByUsername(req, res);
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
