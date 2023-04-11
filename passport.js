/**
 * Passport configuration
 * @module passport
 */


const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

/**
 * Create a new LocalStrategy for passport authentication
 * @function
 * @name localStrategy
 * @param {string} Username - The username provided by the user
 * @param {string} Password - The password provided by the user
 * @param {function} callback - The callback function that will be called after authentication
 * @returns {function} - The callback function with the user object or an error
 */
passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
    }, 
    (username, password, callback) => {
        console.log(username + ' ' + password);
        Users.findOne({Username: username}, (error, user) => {
            if(error) {
                console.log(error);
                return callback(error);
            }
            if(!user) {
                console.log('incorrect username');
                return callback(null, false, {message: 'Incorrect username'});
            }
            if(!user.validatePassword(password)) {
                console.log('incorrect password');
                return callback(null, false, {message: 'Incorrect password'});
            }

            console.log.apply('finished');
            return callback(null, user);
        });
    }
));

/**
 * Create a new JWTStrategy for passport authentication
 * @function
 * @name jwtStrategy
 * @param {Object} jwtPayload - The JWT payload containing user information
 * @param {function} callback - The callback function that will be called after authentication
 * @returns {function} - The callback function with the user object or an error
 */
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
    },
    (jwtPayload, callback) => {
        return Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });
    }
));