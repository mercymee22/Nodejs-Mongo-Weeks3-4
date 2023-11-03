// Require passport middleware, the strategy constructor form the passport-local library, user model which has access to the passport local mongoose plugin already.

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt; // This is an object that provide us with several helper methods. We'll use one to extract the jw token from a request object
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config.js');

// passport.use(new LocalStrategy) - passport.use method is how we add the specific strategy plugin that we want to use.
// (new LocalStrategy) - Create a new insance of LocalStrategy and pass it in. 
// User.authenticate - LocalStrategy requires a verify callback function that will verify the username and password against the locally stored usernames and passwords. provided by the passport local mongoose plugin.
// (de)serializeUser - When using sessions with passport. When a user has been successfully verified, the user data has to be grabbed from the session and added to the request object. a process called deserialization that needs to happen to to the data in order for that to be possible. 

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// getToken = function(user) - function that receives an object called user
// user - this object will contains an id for a user document
// jwt.sign - this method returns a token.
// jwt.sign(user, config.secretKey, {expiresIn: 3600}) - Takes the user argument passed in as the first argument. 2nd argument: secret key string from config.js. 3rd argument: configure token to expire in 1 hour.

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

// configure the jwt strategy for passport.
// const opts = {} - contains the options for the jwt strategy.
// opts.jwtFromRequest - set 2 properties on the opts object. 
// ExtractJwt - imported ExtractJwt, one of it's methods: fromAuthHeaderAsBearerToken, specifies how a json web token should be extracted from the incoming message. (ie: sent as a request header, in request body, as a url request parameter.)
// opts.secretOrKey - supply the jwt strategy with the key with which we'll assign this token.

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// export the jwt strategy
// passport.use - this method takes an instance of the jwt strategy as an argument, create that using the new JwtStrategy.
// new JwtStrategy - This constructor needs 2 arguments.
// opts - 1st argument, an object with configuration options, which we created earlier. 2nd option, a verify callback function.
// Passport jwt modules documentation tells us everything we need to know about writing this verify function. https://www.passportjs.org/packages/passport-jwt/
// (jwt_payload, done) - pass in these 2 arguments. Console log the jwt_payload object. Use the findOne method to check for a user document with an id that matches the one in the jwp payload object.
// The findOne() method returns the first occurrence in the selection. The first parameter of the findOne() method is a query object.
// (err, user) - set up an error callback, so, if (err), if there was an error we'll send that error to the done callback and say false for the second argument, to say that no user was found if there wasn't an error. Then we'll check if a user was found and if so we'll return the done callback with no for the first argument to say no error, then the user document as the second argument. Then passport will use the done callback to access the user document so that it can load information from it to the request object.
// user = user document. "done" is a callback function that's written in the passport-jwt module.

exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {                    // if there was an error send it to the done callback function
                    return done(err, false);  // 1. error, 2. false - no user was found
                } else if (user) {
                    return done(null, user);  // if user was found, return done callback, null - no error, user - user document
                } else {
                    return done(null, false); // no error but no user document found that matched what was in the token.
                }
            });
        }
    )
);

// passport.authenticate - Use this to verify that an incoming request is from an authenticated user. 
// 1st argument jwt to say that we want to use the json web token strategy. 2nd argument session: false option will make so we're not using sessions.

exports.verifyUser = passport.authenticate('jwt', {session: false});