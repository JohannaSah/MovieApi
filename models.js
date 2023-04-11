/**
 * This module defines Mongoose schemas and models for Movies, Users, Directors and Genres collections.
 * It exports the models for use in other modules.
 */

// import mongoose package to work with it
const mongoose = require('mongoose');
    bcrypt = require('bcrypt');

/* // Schemas
// Schemas can contain
// - key:value pairs
// - key:{type: datatype, required: true} if sth is mandatory
//- Subdocuments (See Genre or Director), nested Data
// - key:Array with contained Datatype (see Actors)
// - References using ref attribute (see FavoriteMovies)
// - mongoose .populate method (see FavoriteMovies), way to populate one collection with an array of embedded documents from another collection

*/
// define movieSchema
/**
 * @typedef {Object} MovieDocument - The Mongoose database movie document.
 * @property {string} Title - The title of the movie.
 * @property {string} Description - A brief description of the movie.
 * @property {Object} Genre - The genre of the movie.
 * @property {string} Genre.Name - The name of the genre.
 * @property {string} Genre.Description - A brief description of the genre.
 * @property {Object} Director - The director of the movie.
 * @property {string} Director.Name - The name of the director.
 * @property {string} Director.Bio - A brief biography of the director.
 * @property {string} Director.YearofBirth - The year the director was born.
 * @property {string} Director.YearofDeath - The year the director died.
 * @property {Array.<string>} Actors - An array of the names of the actors in the movie.
 * @property {string} ImagePath - The file path to the movie's image.
 * @property {boolean} Featured - Whether or not the movie is a featured movie.
 */
let movieSchema = mongoose.Schema({ 
    Title: {type: String, required: true},
    Description: { type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        YearofBirth: String,
        YearofDeath: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
}, { collection : 'Movies' });

// define userSchema
/**
 * @typedef {Object} UserDocument - The Mongoose database user document.
 * @property {string} Username - The username of the user.
 * @property {string} Password - The password of the user.
 * @property {string} Email - The email address of the user.
 * @property {Date} Birthday - The birthday of the user.
 * @property {Array.<Object>} FavoriteMovies - An array of favorite movies of the user.
 * @property {mongoose.Types.ObjectId} FavoriteMovies._id - The unique identifier of the favorite movie.
 * @property {string} FavoriteMovies.Title - The title of the favorite movie.
 */
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
}, { collection : 'Users'});

// add hashPassword function to userSchema
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

// add validatePassword function to userSchema
// do not use arrow functions when defining instance methods
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

// define directorSchema
/**
 * @typedef {Object} DirectorDocument - The Mongoose database director document.
 * @property {string} Name - The name of the director.
 * @property {string} Bio - A brief biography of the director.
 * @property {string} YearofBirth - The year the director was born.
 * @property {string} YearofDeath - The year the director died.
 */
let directorSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Bio: String, 
    YearofBirth: String, 
    YearofDeath: String
}, {collection : 'Directors'});

// define genreSchema
/**
 * @typedef {Object} GenreDocument - The Mongoose database genre document.
 * @property {string} Name - The name of the genre.
 * @property {string} Description - A brief description of the genre.
 */

let genreSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Description: {type: String, required: true}
}, {collection: 'Genres'});

// create models
// use the defined Schemas to create collections called db.movies and db.users (everything is pluralized and lowercaed automatically)
/**
 * Creates models using the defined schemas for the Movies, Users, Directors, and Genres collections.
 * The models are named Movie, User, Director, and Genre respectively, and are exported for use in other modules.
 *
 * @type {import('mongoose').Model<import('mongoose').Document<any>>, undefined>}
 */
let Movie = mongoose.model('Movie', movieSchema);
/**
 * Creates models using the defined schemas for the Movies, Users, Directors, and Genres collections.
 * The models are named Movie, User, Director, and Genre respectively, and are exported for use in other modules.
 *
 * @type {import('mongoose').Model<import('mongoose').Document<any>>, undefined>}
 */
let User = mongoose.model('User', userSchema);
/**
 * Creates models using the defined schemas for the Movies, Users, Directors, and Genres collections.
 * The models are named Movie, User, Director, and Genre respectively, and are exported for use in other modules.
 *
 * @type {import('mongoose').Model<import('mongoose').Document<any>>, undefined>}
 */
let Director = mongoose.model('Director', directorSchema);
/**
 * Creates models using the defined schemas for the Movies, Users, Directors, and Genres collections.
 * The models are named Movie, User, Director, and Genre respectively, and are exported for use in other modules.
 *
 * @type {import('mongoose').Model<import('mongoose').Document<any>>, undefined>}
 */
let Genre = mongoose.model('Genre', genreSchema);

//export models
// export models in order to be able to import them into index.js
/**
 * Exports the Movie, User, Director, and Genre models for use in other modules.
 * 
 * @type {Object}
 * @property {import('mongoose').Model<import('mongoose').Document<any>>, undefined} Movie The Movie model.
 * @property {import('mongoose').Model<import('mongoose').Document<any>>, undefined} User The User model.
 * @property {import('mongoose').Model<import('mongoose').Document<any>>, undefined} Director The Director model.
 * @property {import('mongoose').Model<import('mongoose').Document<any>>, undefined} Genre The Genre model.
 */
module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
module.exports.Genre = Genre;
