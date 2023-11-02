// Require passport middleware, the strategy constructor form the passport-local library, user model which has access to the passport local mongoose plugin already.

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport.use(new LocalStrategy) - passport.use method is how we add the specific strategy plugin that we want to use.
// (new LocalStrategy) - Create a new insance of LocalStrategy and pass it in. 
// User.authenticate - LocalStrategy requires a verify callback function that will verify the username and password against the locally stored usernames and passwords. provided by the passport local mongoose plugin.
// (de)serializeUser - When using sessions with passport. When a user has been successfully verified, the user data has to be grabbed from the session and added to the request object. a process called deserialization that needs to happen to to the data in order for that to be possible. 

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
