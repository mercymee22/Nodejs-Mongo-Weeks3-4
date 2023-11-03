// Express Router. This module contains the code for handling the rest api endpoints (get, put, post, delete) for any path that begins with /campsites
// express.Router - This method gives us an object named campsiteRouter that we can use with express routing methods.
// campsiteRouter.route('/') - path set up

const express = require('express');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

const campsiteRouter = express.Router();

// chain the methods into a single chain. All these methods share the same path, /campsites, which was defined in server.js. End up with a single statment that handles all the endpoints for routing to campsites.
// both routes ('/') and ('/:campsiteId) are attached to the same object (campsiteRouter) so when campsiteRouter is exported, 1 object with all the routes chained together are exported.
// .populate('comments.author') - tells our application that when the campsite's documents are retreived to populate the author field of the commments sub-document by finding the user document that matches the object id that's stored there.
// res.json - this method, passed the campsites argument, sends json data to the client in the response stream and automatically closes the response stream afterward, so don't need res.end.
// .catch(err => next(err)) - catches any errors and the next function passes the error to the overall error handler in the express application since it has built in error handling.
// Campsite.create(req.body) - creates a new campsite document and saves it to the MondoDB server. Create the document from request body which contains the info for the campsite, to post from the client.  This is a method provided by Mongoose for creating a new document in the collection associated with the specified model. When you call Campsite.create(), you're telling Mongoose to create a new document in the "Campsite" collection.
// .then(campsite) - campsite variable hold info about the document that was posted.
// .delete((req, res, next) - pass in next method for error handling
// Campsite.deleteMany - empty array results in every document in the campsites collection being deleted.
// $set: req.body - The second argument specifies the update to be applied, where req.body contains the new data to set for the document.
// authenticate.verifyUser - verify that the user is authenticated for every endpoint in this router except the get endpoints because get is a simple read only operation.
// .populate('comments.author') - tells our application, when the campsite's documents are retreived to populate the author field of the comments sub-document by finding the user document that matches the object id that's stored there.

campsiteRouter.route('/')
    .get((req, res, next) => {
        Campsite.find()
        .populate('comments.author')
            .then(campsites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsites);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Campsite.create(req.body)
            .then(campsite => {
                console.log('Campsite created ', campsite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

campsiteRouter.route('/:campsiteId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true })
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

// comments are created from the mongoose comments schema & included inside a campsite document as a subdocument
// ('/:campsiteId/comments') - we're accessing a subdocument, adding a new comment to an existing campsite document
// -- .get --
// Campsite.findById(req.params.campsiteId) - supply this findById method with an argument that tells it what ID to look for.
// once we have the right campsite document back from the findById method, then we need to access the comments inside the campsite so we can return to the client a response that contains only the comments for this campsite not all the campsites info.
// get comfortable with the reading the documentation for libraries and frameworks, getting used to looking for info in them because that's a big part of what you do as a web developer.
// res.json(campsite.comments) - The campsites document gets returned as a javascript object so we can access the comments array inside the campsites object. The res.json method will make sure that it's appropriately formatted as json when it enters the response stream.
// err = new Error - set up a new error object with an error message.
// return next(err) - This will pass off this error to the express error handling mechanism.
// -- .post --
// Post Method - add a new comment to the list of comments for a particular campsite.
// if (campsite) - make sure a non null truthy value was returned for the campsite document
// campsite.comments.push(req.body) - array method to push the new comment into the comments array. Assuming the req.body has a comment in it.
// campsite.comments.push(req.body) - this has only changed the comments array in the application's memory, not the comments sub-document in the mongodb database.
// campsite.save() - use this to save changes to the Mongo database. the c in campsite is lowercase because it's not a static method, it a method being performed on this particular campsite instance, the document itself.
// -- .delete --
// for loop - goes through and deletes every comment in the campsites array, (go over this loop to understand it.)
//  campsite.comments.push(req.body) - when the comment is sent to the server it's sent in the body. Here we push the body into the comments array.
//  req.body.author = req.user._id - , this adds the id of the current user to that request body as the author before it gets pushed into the comments array. This ensures that when the comment is saved, it will have the id of the user who submitted the comment in the author field.

campsiteRouter.route('/:campsiteId/comments')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
            .then(campsite => {
                if (campsite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments);
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    req.body.author = req.user._id;
                    campsite.comments.push(req.body);
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite.comments);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    for (let i = (campsite.comments.length - 1); i >= 0; i--) {
                        campsite.comments.id(campsite.comments[i]._id).remove();
                    }
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite.comments);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

// campsiteRouter.route('/:campsiteId/comments/:commentId') - handle requests for a specific comment of a specific campsite
// -- .get --
// campsite && campsite.comments.id - check if the campsite and the comment is a non truthy value
// campsite && campsite.comments.id(req.params.commentId) - pass the document ID in as an argument, this will retreive the value of the comment sub document with the ID passed in.
// res.json(campsite.comments.id(req.params.commentId)) - in the json response, use the .id method again then pass in the id that was requested.
// else if (!campsite) - if the value of the campsite variable was truthy but the value of the comment was not.
// -- .put --
// .put - put request only updates an existing field, we want to update the comment text and rating fields
//  if (req.body.rating) - check to see if a new rating has been passed in.
// campsite.comments.id(req.params.commentId).rating = req.body.rating - update the rating for this comment. Update the comment text in the next if statement.
// campsite.comments.id(req.params.commentId).text = req.body.text - Set the text for the specified comment with the new text. 2 if statement will both get checked unlike if/else. So it could potentially update both, either, or none of the comment and rating text.
// campsite.save() - save any updates to the mongoDB server.
// .then(campsite - if the operation succeeds, send back a response to the client
// res.json(campsite) - json response with an updated campsite
// -- .delete --
// campsite.comments.id(req.params.commentId).remove() - removes a comment

campsiteRouter.route('/:campsiteId/comments/:commentId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments.id(req.params.commentId));
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite && campsite.comments.id(req.params.commentId)) {
                if (req.body.rating) {
                    campsite.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.text) {
                    campsite.comments.id(req.params.commentId).text = req.body.text;
                }
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else if (!campsite) {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                err = new Error(`Comment ${req.params.commentId} not found`);
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
                campsite.comments.id(req.params.commentId).remove();
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else if (!campsite) {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    });

module.exports = campsiteRouter;