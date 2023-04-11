
/**
 * JWT Secret key used for encoding and decoding JWT
 * @type {string}
 */
const jwtSecret = 'your_jwt_secret'; // must be same as key used in JWTStrategy

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); // the local passport file

/**
 * Generates JWT token with provided user data.
 * @param {object} user - The user object to be encoded in JWT token
 * @returns {string} The generated JWT token
 */
let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, // this is the username being encoded in the JWT
        expiresIn: '7d', // token expiry time
        algorithm: 'HS256' // algorithm used to encode values of JWT
    });
};

/* POST login */
module.exports = (router) => {

    /**
     * POST login endpoint that authenticates user and returns JWT token
     * @name POST/login
     * @function
     * @memberof module:routes~authRoutes
     * @inner
     * @param {string} path - Express path
     * @param {callback} middleware - Express middleware
     * @param {callback} callback - Express callback function
     */
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right', 
                    user: user
                });
            }
            req.login(user, {session: false}, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({user, token}); // E6 shorthand for res.json({user: user, token: token}), when key = values it can be shortened in E6
            });
        }) 
        (req, res);
    });
}