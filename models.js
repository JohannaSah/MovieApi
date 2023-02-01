// import mongoose package to work with it
const mongoose = require('mongoose'),
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
        YeardofDeath: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
}, { collection : 'Movies' });

// define userSchema
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
let directorSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Bio: String, 
    YearofBirth: String, 
    YeardofDeath: String
}, {collection : 'Directors'});

// define genreSchema
let genreSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Description: {type: String, required: true}
}, {collection: 'Genres'});

// create models
// use the defined Schemas to create collections called db.movies and db.users (everything is pluralized and lowercaed automatically)
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Director = mongoose.model('Director', directorSchema);
let Genre = mongoose.model('Genre', genreSchema);

//export models
// export models in order to be able to import them into index.js
module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
module.exports.Genre = Genre;
