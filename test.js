// ---TASK 1--- (authenticate.js)
// Based on your description, it sounds like you're using the popular `passport` library for authentication in your Node.js app. In Node.js,... 
// ...middleware functions are used to perform operations on the request and response objects before they reach a route handler function.

// The `verifyAdmin` function will behave as middleware in your Express app. This is how you could implement it in your `authenticate.js` file:

// ```javascript
function verifyAdmin(req, res, next) {
    // Check if 'user' property is loaded in req by Passport and 'admin' property is true
    if (req.user && req.user.admin === true) {
        // If admin, pass control to the next middleware function
        return next();
    } else {
        // If not an admin, create a new Error
        const error = new Error("You are not authorized to perform this operation!");
        error.status = 403;
        // Pass this Error to the next middleware function
        return next(error);
    }
}

module.exports = verifyAdmin;

// In this code, `verifyAdmin` checks if `req.user` and `req.user.admin` exist and `admin` is `true`. If so, it calls `next()`, allowing the request...
//...to proceed to the next middleware function. If not, it creates an `Error` with an appropriate message and status code, and passes control to the...
//...Express error handling middleware with `next(error)`. Finally, `verifyAdmin` is exported for use in other parts of the app.


//---TASK 2---(campsiteRouter, partnerRouter, promotionRouter)
//To protect the specified REST API endpoints and authorize only admin accounts to access them, you can add a middleware function named verifyAdmin...
//...to the routes that need this authorization. Here's how you can do that in your campsiteRouter.js file:

//First, create a verifyAdmin function that checks if the user is an admin. You can use this function to protect the routes.

//------------------------------------------------
// Import the necessary modules and models
const express = require('express');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

// Create the verifyAdmin function
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.admin) {
    return next(); // User is an admin, proceed to the next middleware
  } else {
    const err = new Error('You are not authorized to perform this operation!');
    err.status = 403; // Forbidden
    return next(err);
  }
};
// Rest of your code
//-------------------------------------------------

//Now, add the verifyAdmin middleware to the routes that should be protected:

//-------------------------------------------------
// For POST and DELETE operations on /campsites
campsiteRouter.route('/')
  .post(authenticate.verifyUser, verifyAdmin, (req, res, next) => {
    // Your code for handling the POST request
  })
  .delete(authenticate.verifyUser, verifyAdmin, (req, res, next) => {
    // Your code for handling the DELETE request
  });

// For PUT and DELETE operations on /campsites/:campsiteId
campsiteRouter.route('/:campsiteId')
  .put(authenticate.verifyUser, verifyAdmin, (req, res, next) => {
    // Your code for handling the PUT request
  })
  .delete(authenticate.verifyUser, verifyAdmin, (req, res, next) => {
    // Your code for handling the DELETE request
  });

// For DELETE operation on /campsites/:campsiteId/comments
campsiteRouter.route('/:campsiteId/comments')
  .delete(authenticate.verifyUser, verifyAdmin, (req, res, next) => {
    // Your code for handling the DELETE request
  });
// Rest of your code
//----------------------------------------------------

// Now, these routes will only allow access to users who are authenticated and have admin privileges. If the user is not an admin, they will receive...
// ...a 403 Forbidden error. Make sure to have the verifyAdmin middleware in place and ensure that the req.user object is properly populated with...
//...user information during the authentication process.


//---TASK 3---(users.js)
// To allow only admin users to access the /users endpoint for GET requests and deny access to ordinary users, you can modify the...
//...router.get('/', ...) route in your users.js file. You'll need to add the authenticate.verifyUser middleware to ensure users are authenticated, and...
//...then use a custom middleware function, like checkAdmin, to verify if the user is an admin. Here's how you can do it:

//-----------------------------------------------------
const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();

// Custom middleware to check if the user is an admin
const checkAdmin = (req, res, next) => {
  if (req.user && req.user.admin) {
    return next(); // User is an admin, proceed to the next middleware
  } else {
    const err = new Error('You are not authorized to access this resource!');
    err.status = 403; // Forbidden
    return next(err);
  }
};

// GET request for /users
router.get('/', authenticate.verifyUser, checkAdmin, (req, res, next) => {
  User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    })
    .catch((err) => next(err));
});
// Rest of your code
//-----------------------------------------------------

// With this setup, the router.get('/users', ...) route will only allow access to authenticated users who are also admins. If a user is not an admin,...
//...they will receive a 403 Forbidden error. This ensures that only admin users can access the details of all existing user documents.


//---TASK 4---(campsiteRouter.js)
// To allow logged-in users to update or delete only the comments that they themselves submitted, you can modify the routes in your campsiteRouter.js file...
//...You need to check if the logged-in user is the author of the comment before allowing the update or delete operation. You can do this by comparing...
//...the user's _id with the comment's author field. Here's how you can implement this:

//-----------------------------------------------------
// Import necessary modules and models
const express = require('express');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

const campsiteRouter = express.Router();

// ... (other routes)

// For PUT and DELETE operations on /campsites/:campsiteId/comments/:commentId
campsiteRouter.route('/:campsiteId/comments/:commentId')
  .put(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
          const comment = campsite.comments.id(req.params.commentId);
          if (comment.author.equals(req.user._id)) {
            // User is the author of the comment, allow the update
            if (req.body.rating) {
              comment.rating = req.body.rating;
            }
            if (req.body.text) {
              comment.text = req.body.text;
            }
            campsite.save()
              .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
              })
              .catch(err => next(err));
          } else {
            const err = new Error('You are not authorized to update this comment!');
            err.status = 403; // Forbidden
            return next(err);
          }
        } else if (!campsite) {
          const err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        } else {
          const err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
          const comment = campsite.comments.id(req.params.commentId);
          if (comment.author.equals(req.user._id)) {
            // User is the author of the comment, allow the delete
            comment.remove();
            campsite.save()
              .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
              })
              .catch(err => next(err));
          } else {
            const err = new Error('You are not authorized to delete this comment!');
            err.status = 403; // Forbidden
            return next(err);
          }
        } else if (!campsite) {
          const err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        } else {
          const err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  });

// ... (other routes)

module.exports = campsiteRouter;
//-----------------------------------------------------

// With this code, you are checking whether the logged-in user is the author of the comment before allowing the update or delete operation. If the user...
//is not the author, they will receive a 403 Forbidden error.