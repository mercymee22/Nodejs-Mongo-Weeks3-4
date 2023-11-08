const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

// Multer diskStorage method with an an object containing a couple of configuration settings.
// cb(null, 'public/images') - callback function, no error, path we want to save the file to.
// file.originalname - Makes sure the name of the file on the server is the same as name on client side. If not set then multer will the filename a random string.

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

// if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/) - using Regex. checks if the file extension is not one these extensions.
// false - tells multer to reject this file upload
// (null, true) - tells multer, no error, accept this file.

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

//calling the multer function
const upload = multer({ storage: storage, fileFilter: imageFileFilter});

// configure the upload router to handle the various http requests below
const uploadRouter = express.Router();

// imageUpload is the path we'll be using
// upload.single('imagFile') - adds the multer middleware. says we're expecting a singlle file upload who's input name is imageFile. When a client uploads a file to the server, at this point multer will take over and handle processing it, along with any errors.
// res.json(req.file) - Multer adds an object to the request object named file and the file contains a bunch of additional info about the file. Here we're sending that info back to the client and it will confirm to the client, the file has been received correctly.

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
})

module.exports = uploadRouter;