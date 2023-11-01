const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* GET user listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// router.post('/signup' - allows a new user to register, signup path.
//  User.findOne - check that the username isn't already taken. Using the static method, findOne on the users model to see if there's any existing user documents with the same name the client has entered.
// .then(user) - promise .then method to deal with the resolved promise.
// if (user) - if this evaluates to truthy then a user document was found with a matching name ans so we set up an error object.
// User.create - create a new user from the clients post request body. create method returns a promise
// .then(user) - The resolve value from the promise should be the user document that was added. Use the response object stream to send that back to the client.
// res.json - send back a status message, along with a representation of the user document.
// user: user - forms an object as a part of the express response that will be sent back to the client. user: user` is setting the value of the 'user' key to the user object document that was just created in the MongoDB database.
// recap for router.post - From the client side the user would go to this path / user / signup, then post a request with a username and password and that would be handled by this endpoint (/signup).

router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then(user => {
      if (user) {
          const err = new Error(`User ${req.body.username} already exists!`);
          err.status = 403;
          return next(err);
      } else {
          User.create({
              username: req.body.username,
              password: req.body.password})
          .then(user => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({status: 'Registration Successful!', user: user});
          })
          .catch(err => next(err));
      }
  })
  .catch(err => next(err));
});

// router.post('/login' - post request to /users/login
// (req, res, next) => - This post method, as usual, needs a middleware funciton to be passed in as the second argument after the path.
// if(!req.session.user) - check if the user is already logged in (if we're already tracking an authenticated session for this user).
// !req.session.user) - The properties of this rec.session object is automatically filled in based on if the request headers contained a cookie with an existing session id.
// User.findOne - Take the username and password the client is sending and check it against the user documents in our database. if we find a user document that has a matching username and password we can authenticate this login. check the name field since it's unique.
// User.findOne({ username: username }) - Use the find one method on the user's collection to see if we have any matching names, if not we set up and send an error response saying the username doesn't exist.

router.post('/login', (req, res, next) => {
  if(!req.session.user) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
          const err = new Error('You are not authenticated!');
          res.setHeader('WWW-Authenticate', 'Basic');
          err.status = 401;
          return next(err);
      }
    
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const username = auth[0];
      const password = auth[1];
    
      User.findOne({username: username})
      .then(user => {
          if (!user) {
              const err = new Error(`User ${username} does not exist!`);
              err.status = 401;
              return next(err);
          } else if (user.password !== password) {
              const err = new Error('Your password is incorrect!');
              err.status = 401;
              return next(err);
          } else if (user.username === username && user.password === password) {
              req.session.user = 'authenticated';
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/plain');
              res.end('You are authenticated!')
          }
      })
      .catch(err => next(err));
  } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are already authenticated!');
  }
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

