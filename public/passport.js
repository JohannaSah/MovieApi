const passport = require('passport'),
    LocalStrategy = require('passport-local'),
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
    }, 
    (username, password, callback) => {
        console.log(username + ' ' + password);
        Users.findOne({Username: username}, (error, user) => {
            if(error) {
                console.log(error);
                return callback0(error);
            }
            if(!user) {
                console.log('incorrect username');
                return callback0(null, false, {message: 'Incorrect username or password'});
            }

            console.log.apply('finished');
            return callback(null, user);
        });
    }
));

passport.use(new.JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
    },
    (jwtPayload, callback) => {
        return Users.findByID(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });
    }
));