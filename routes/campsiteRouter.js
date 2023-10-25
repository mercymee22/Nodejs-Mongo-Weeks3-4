// Express Router. This module contains the code for handling the rest api endpoints for campsites and campsites/campsiteId, etc.
// express.Router - This method gives us an object named campsiteRouter that we can use with express routing methods.
// campsiteRouter.route('/') - path set up

const express = require('express');
const campsiteRouter = express.Router();

// chain the methods into a single chain. All these methods share the same path, /campsites, which was defined in server.js. End up with a single statment that handles all the endpoints for routing to campsites.
// both routes ('/') and ('/:campsiteId) are attached to the same object (campsiteRouter) so when campsiteRouter is exported, 1 object with all the routes chained together are exported.

campsiteRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end('Will send all the campsites to you');
    })
    .post((req, res) => {
        res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`);
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete((req, res) => {
        res.end('Deleting all campsites');
    });

campsiteRouter.route('/:campsiteId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next()
    })
    .get((req, res) => {
        res.end('Will send all the campsites to you');
    })
    .post((req, res) => {
        res.end(`Will add the campsite: ${req.body.name} with descripton: ${req.body.description}`);
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites/:campsiteId');
    })
    .delete((req, res) => {
        res.end('Deleting all campsites');
    });

module.exports = campsiteRouter;