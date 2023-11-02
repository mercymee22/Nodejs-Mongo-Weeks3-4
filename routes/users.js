const express = require('express');
const User = require('../models/user');
const passport = require('passport');

const router = express.Router();

/* GET user listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// router.post('/signup' - allows a new user to register, signup path.
// User.register - called as a static method on the User model. 3 arguments to this register method. 
// new User({username: req.body.username}) - 1st argument, create a new User with a name given to us from the client. 
// req.body.password - 2nd argument will be a password, plug in directly from the incoming request from the client.
// err - 3rd argument a callback method which will recieve an error if there was one from the register method.
// res.statusCode = 500 - internal server error.
// res.json({err: err}) - send back a json object as a response. provides info about the error property on the error object.
//  passport.authenticate('local') - if no error, then use passport to authenticate the newly registered user. Authenticate method returns a function. call that function and pass in the rec, res object along with a callback function that will set up a response to the client.

router.post('/signup', (req, res) => {
    User.register(
        new User({username: req.body.username}),
        req.body.password,
        err => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, status: 'Registration Successful!'});
                });
            }
        }
    );
});

// router.post('/login' - post request to /users/login
// (req, res) => - This post method, as usual, needs a middleware funciton to be passed in as the second argument after the path.
// passport.authenticate('local') - added as a second argument, enables passport authentication on this route. Will handle logging in the user including challenging the user for credentials, parsing the credentials from the request body, taking care of errors, etc. We just have to send the successful response.

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'You are successfully logged in!'});
});


// router.get - for logging out the user. Use get because client is not submitting anything like username, just saying, I'm done, stop tracking my session.
// if (req.session) - check if a session exists.
// req.session.destroy - if it does, destroy/delete the session on the server side.
// res.clearCookie('session-id') - express method on the response object, passed the name of the session that was configured in app.js. This clears the cookie stored on the client.
// res.redirect('/') - calling a method on the response object, this redirects the user to the root path (localhost 3000/)
// else - if a session doesn't exist (the client is requesting to log out without being logged in).

router.get('/logout', (req, res, next) => {
  if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
  } else {
      const err = new Error('You are not logged in!');
      err.status = 401;
      return next(err);
  }
});

module.exports = router;

